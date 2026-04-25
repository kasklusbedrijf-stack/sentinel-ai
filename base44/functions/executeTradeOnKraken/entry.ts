import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Helper: sign a Kraken private API request
async function signKrakenRequest(apiPath, nonce, postData, apiSecret) {
  const encoder = new TextEncoder();
  
  // SHA-256 of (nonce + postData)
  const sha256Input = encoder.encode(nonce + postData);
  const sha256Hash = await crypto.subtle.digest('SHA-256', sha256Input);
  
  // HMAC-SHA-512 key from secret
  const secretBytes = Uint8Array.from(atob(apiSecret), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  // Message = apiPath bytes + SHA-256 hash bytes
  const pathBytes = encoder.encode(apiPath);
  const combined = new Uint8Array(pathBytes.length + sha256Hash.byteLength);
  combined.set(pathBytes, 0);
  combined.set(new Uint8Array(sha256Hash), pathBytes.length);
  
  const signature = await crypto.subtle.sign('HMAC', key, combined);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { trade_approval_id, validation_only } = body;

    if (!trade_approval_id) {
      return Response.json({ error: 'trade_approval_id required' }, { status: 400 });
    }

    // --- LIVE MODE is opt-in: caller must explicitly pass validation_only: false ---
    const VALIDATION_MODE = validation_only !== false;

    // Fetch the trade approval
    const approvals = await base44.asServiceRole.entities.TradeApproval.filter({
      id: trade_approval_id,
    });

    if (!approvals || approvals.length === 0) {
      return Response.json({ error: 'Trade approval not found' }, { status: 404 });
    }

    const trade = approvals[0];

    // [SAFETY 1] IDEMPOTENCY: block if approval already linked to an order
    if (trade.exchange_order_id) {
      return Response.json(
        { error: 'This trade approval already has an active order', existing_order: trade.exchange_order_id },
        { status: 409 }
      );
    }

    // Validate status
    if (trade.status !== 'approved') {
      return Response.json(
        { error: `Trade must be in 'approved' status, got: ${trade.status}` },
        { status: 400 }
      );
    }

    // [SAFETY 2] DUPLICATE GUARD: check ExchangeOrder table
    const existingOrders = await base44.asServiceRole.entities.ExchangeOrder.filter({
      trade_approval_id: trade_approval_id,
    });
    if (existingOrders && existingOrders.length > 0) {
      return Response.json(
        { error: 'Order already submitted for this trade approval', order_id: existingOrders[0].id },
        { status: 409 }
      );
    }

    // --- Risk settings safety checks ---
    const riskSettings = await base44.asServiceRole.entities.RiskSettings.list('-created_date', 1);
    const settings = riskSettings?.[0];

    if (settings?.emergency_stop_active) {
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'rejected',
        rejection_reason: 'Emergency stop is active',
      });
      return Response.json({ success: false, error: 'Emergency stop is active' }, { status: 403 });
    }

    if (trade.confidence_score != null && trade.confidence_score < (settings?.min_confidence_threshold || 65)) {
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'rejected',
        rejection_reason: `Confidence ${trade.confidence_score}% below threshold ${settings?.min_confidence_threshold}%`,
      });
      return Response.json({ success: false, error: 'Confidence threshold not met' }, { status: 400 });
    }

    if (trade.risk_score != null && trade.risk_score > (settings?.max_risk_score_threshold || 70)) {
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'rejected',
        rejection_reason: `Risk score ${trade.risk_score} exceeds threshold ${settings?.max_risk_score_threshold}`,
      });
      return Response.json({ success: false, error: 'Risk score exceeds threshold' }, { status: 400 });
    }

    const openOrders = await base44.asServiceRole.entities.ExchangeOrder.filter({ status: 'open' });
    if (openOrders && openOrders.length >= (settings?.max_open_positions || 5)) {
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'rejected',
        rejection_reason: `Max open positions (${settings?.max_open_positions}) reached`,
      });
      return Response.json({ success: false, error: 'Max open positions reached' }, { status: 400 });
    }

    // --- Kraken credentials ---
    const krakenApiKey = Deno.env.get('KRAKEN_API_KEY');
    const krakenApiSecret = Deno.env.get('KRAKEN_API_SECRET');

    if (!krakenApiKey || !krakenApiSecret) {
      return Response.json({ error: 'Kraken API credentials not configured' }, { status: 500 });
    }

    // [SAFETY 3] BALANCE VALIDATION: fetch live balance before any order attempt
    const balanceNonce = Date.now().toString();
    const balancePostData = `nonce=${balanceNonce}`;
    const balancePath = '/0/private/Balance';
    const balanceSig = await signKrakenRequest(balancePath, balanceNonce, balancePostData, krakenApiSecret);

    const balanceResp = await fetch('https://api.kraken.com' + balancePath, {
      method: 'POST',
      headers: {
        'API-Key': krakenApiKey,
        'API-Sign': balanceSig,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: balancePostData,
    });

    const balanceData = await balanceResp.json();

    if (!balanceResp.ok || (balanceData.error && balanceData.error.length > 0)) {
      return Response.json(
        { success: false, error: 'Failed to fetch Kraken balance', details: balanceData.error?.join(', ') },
        { status: 400 }
      );
    }

    // For SELL: verify we hold enough of the asset
    if (trade.direction === 'sell') {
      const assetKey = trade.asset_symbol === 'BTC' ? 'XXBT' : `X${trade.asset_symbol}`;
      const altAssetKey = trade.asset_symbol === 'BTC' ? 'XBT' : trade.asset_symbol;
      const available = parseFloat(
        balanceData.result?.[assetKey] ?? balanceData.result?.[altAssetKey] ?? 0
      );
      const quantity = parseFloat(trade.position_size_pct || 1) / 100;
      if (available < quantity) {
        await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
          status: 'rejected',
          rejection_reason: `Insufficient ${trade.asset_symbol} balance: have ${available}, need ${quantity}`,
        });
        return Response.json(
          { success: false, error: `Insufficient ${trade.asset_symbol} balance`, available, required: quantity },
          { status: 400 }
        );
      }
    }

    // For BUY: verify we hold enough USD/stable
    if (trade.direction === 'buy') {
      const usdBalance = parseFloat(
        balanceData.result?.['ZUSD'] ?? balanceData.result?.['USD'] ?? 0
      );
      const requiredUsd = (trade.entry_price || 0) * (parseFloat(trade.position_size_pct || 1) / 100);
      if (usdBalance < requiredUsd) {
        await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
          status: 'rejected',
          rejection_reason: `Insufficient USD balance: have $${usdBalance.toFixed(2)}, need $${requiredUsd.toFixed(2)}`,
        });
        return Response.json(
          { success: false, error: 'Insufficient USD balance', available: usdBalance, required: requiredUsd },
          { status: 400 }
        );
      }
    }

    // --- Pair mapping: Kraken uses non-standard pair names ---
    const KRAKEN_PAIR_MAP = {
      BTC:  'XBTUSD',
      ETH:  'ETHUSD',
      SOL:  'SOLUSD',
      XRP:  'XRPUSD',
      ADA:  'ADAUSD',
      DOT:  'DOTUSD',
      MATIC:'MATICUSD',
      POL:  'POLUSD',
      LINK: 'LINKUSD',
      LTC:  'LTCUSD',
      UNI:  'UNIUSD',
      ATOM: 'ATOMUSD',
      AVAX: 'AVAXUSD',
      DOGE: 'DOGEUSD',
      FIL:  'FILUSD',
      NEAR: 'NEARUSD',
      ARB:  'ARBUSD',
      OP:   'OPUSD',
      INJ:  'INJUSD',
      SUI:  'SUIUSD',
      APT:  'APTUSD',
      TIA:  'TIAUSD',
      WIF:  'WIFUSD',
      PEPE: 'PEPEUSD',
    };
    const krakenPair = KRAKEN_PAIR_MAP[trade.asset_symbol.toUpperCase()] || `${trade.asset_symbol.toUpperCase()}USD`;

    // --- Local fallback minimum order volumes (used only if Kraken AssetPairs API fails) ---
    const KRAKEN_MIN_VOLUME_FALLBACK = {
      BTC:  0.0001,
      ETH:  0.002,
      SOL:  0.5,
      XRP:  10,
      ADA:  10,
      DOT:  0.5,
      AVAX: 0.1,
      MATIC:10,
      POL:  10,
      LINK: 0.5,
      LTC:  0.1,
      UNI:  0.3,
      ATOM: 0.3,
      DOGE: 50,
      FIL:  0.5,
      NEAR: 1,
      ARB:  10,
      OP:   3,
      INJ:  0.3,
      SUI:  2,
      APT:  0.5,
      TIA:  0.5,
      WIF:  2,
      PEPE: 5000000,
    };

    // --- Fetch real pair rules from Kraken public AssetPairs API (no auth needed) ---
    let minVol = KRAKEN_MIN_VOLUME_FALLBACK[trade.asset_symbol.toUpperCase()] ?? 1;
    let minVolumeSource = 'fallback_table';
    let pairInfo = null;

    try {
      const pairsResp = await fetch(`https://api.kraken.com/0/public/AssetPairs?pair=${encodeURIComponent(krakenPair)}`);
      if (pairsResp.ok) {
        const pairsData = await pairsResp.json();
        if (!pairsData.error || pairsData.error.length === 0) {
          // Result keys may differ from the queried pair name (e.g. "SOLUSD" vs "SOLXBT")
          const pairKey = Object.keys(pairsData.result || {})[0];
          if (pairKey) {
            const info = pairsData.result[pairKey];
            const realMin = parseFloat(info.ordermin);
            if (realMin > 0) {
              minVol = realMin;
              minVolumeSource = 'kraken_api';
            }
            pairInfo = {
              altname: info.altname,
              wsname: info.wsname,
              base: info.base,
              quote: info.quote,
              ordermin: info.ordermin,
              lot_decimals: info.lot_decimals,
              pair_decimals: info.pair_decimals,
              cost_decimals: info.cost_decimals,
              costmin: info.costmin,
            };
          }
        }
      }
    } catch (pairErr) {
      console.warn('[executeTradeOnKraken] AssetPairs fetch failed, using fallback:', pairErr.message);
    }

    const entryPrice = parseFloat(trade.edited_entry || trade.entry_price);
    const usdBalance = parseFloat(balanceData.result?.['ZUSD'] ?? balanceData.result?.['USD'] ?? 0);

    // Volume calculation priority:
    // 1. estimated_risk (USD at risk) / entry_price  — most accurate when pipeline fills it
    // 2. position_size_pct% of available USD balance / entry_price — realistic fallback
    const usdAmount = parseFloat(trade.estimated_risk || 0) > 0
      ? parseFloat(trade.estimated_risk)
      : (parseFloat(trade.position_size_pct || 1) / 100) * usdBalance;

    let quantity = entryPrice > 0 ? usdAmount / entryPrice : 0;
    // Round to lot_decimals from pair info, or default 8
    const lotDecimals = pairInfo?.lot_decimals ?? 8;
    const lotFactor = Math.pow(10, lotDecimals);
    quantity = Math.round(quantity * lotFactor) / lotFactor;

    // Also enforce costmin if provided by Kraken (minimum order cost in quote currency)
    const costMin = pairInfo?.costmin ? parseFloat(pairInfo.costmin) : null;

    const minUsdRequired = minVol * entryPrice;

    // Always attach order_check to every response for UI transparency
    const order_check = {
      symbol: trade.asset_symbol,
      pair: krakenPair,
      calculated_volume: quantity,
      min_volume: minVol,
      min_volume_source: minVolumeSource,
      pair_info: pairInfo,
      cost_min: costMin,
      usd_amount: usdAmount,
      usd_balance: usdBalance,
      entry_price: entryPrice,
      min_usd_required: minUsdRequired,
      passes: quantity >= minVol && quantity > 0,
    };

    if (quantity <= 0) {
      return Response.json({
        success: false,
        error_code: 'VOLUME_ZERO',
        error: `Calculated volume is zero.`,
        order_check,
      }, { status: 400 });
    }

    if (quantity < minVol) {
      return Response.json({
        success: false,
        error_code: 'VOLUME_TOO_SMALL',
        error: `Order volume too small for Kraken minimum.`,
        order_check,
      }, { status: 400 });
    }

    const orderNonce = Date.now().toString();
    // userref must be a positive int32 — derive from timestamp mod max int32
    const userref = (Date.now() % 2147483647).toString();

    const krakenParams = new URLSearchParams({
      nonce: orderNonce,
      ordertype: 'limit',
      type: trade.direction === 'buy' ? 'buy' : 'sell',
      pair: krakenPair,
      price: entryPrice.toString(),
      volume: quantity.toString(),
      userref,
      // [SAFETY 4] EXPLICIT MODE: validate=true means Kraken only validates, never submits
      validate: VALIDATION_MODE ? 'true' : 'false',
    });

    const orderPath = '/0/private/AddOrder';
    const orderPostData = krakenParams.toString();
    const orderSig = await signKrakenRequest(orderPath, orderNonce, orderPostData, krakenApiSecret);

    const orderResp = await fetch('https://api.kraken.com' + orderPath, {
      method: 'POST',
      headers: {
        'API-Key': krakenApiKey,
        'API-Sign': orderSig,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: orderPostData,
    });

    const krakenResponse = await orderResp.json();

    if (!orderResp.ok || (krakenResponse.error && krakenResponse.error.length > 0)) {
      const errorMsg = krakenResponse.error?.join(', ') || `HTTP ${orderResp.status}`;
      const debugInfo = {
        pair: krakenPair,
        volume: quantity,
        price: entryPrice,
        direction: trade.direction,
        usd_amount: usdAmount,
        kraken_raw_errors: krakenResponse.error,
        kraken_http_status: orderResp.status,
      };
      console.error('[executeTradeOnKraken] Kraken rejected order:', JSON.stringify(debugInfo));
      if (!VALIDATION_MODE) {
        await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
          status: 'failed',
          rejection_reason: `Kraken order failed: ${errorMsg}`,
        });
      }
      return Response.json(
        { success: false, error: errorMsg, validation_mode: VALIDATION_MODE, debug: debugInfo },
        { status: 400 }
      );
    }

    // --- VALIDATION MODE: return success without creating any records ---
    if (VALIDATION_MODE) {
      return Response.json({
        success: true,
        validation_mode: true,
        message: 'Order validated by Kraken. No order was submitted.',
        order_check: {
          ...order_check,
          passes: true,
        },
        test_data: {
          pair: krakenPair,
          direction: trade.direction,
          price: trade.entry_price,
          volume: quantity,
        },
      });
    }

    // --- LIVE MODE: create ExchangeOrder and update approval ---
    const krakenOrderId = krakenResponse.result?.txid?.[0] || null;

    const order = await base44.asServiceRole.entities.ExchangeOrder.create({
      trade_approval_id,
      asset_symbol: trade.asset_symbol,
      direction: trade.direction,
      order_type: 'limit',
      entry_price: trade.entry_price,
      quantity,
      stop_loss: trade.stop_loss,
      tp1: trade.tp1,
      tp2: trade.tp2,
      tp3: trade.tp3,
      exchange: 'kraken',
      exchange_order_id: krakenOrderId || 'pending',
      status: 'sent',
      sent_at: new Date().toISOString(),
      raw_response: JSON.stringify(krakenResponse.result || {}),
    });

    await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
      status: 'sent',
      exchange_order_id: order.id,
    });

    await base44.asServiceRole.entities.AuditLog.create({
      action: 'order_placed',
      severity: 'info',
      details: `Live order placed: ${trade.asset_symbol} ${trade.direction} @ ${trade.entry_price}`,
      asset_symbol: trade.asset_symbol,
      metadata: JSON.stringify({ trade_approval_id, exchange_order_id: order.id, kraken_txid: krakenOrderId }),
    });

    await base44.asServiceRole.entities.Alert.create({
      type: 'signal',
      severity: 'info',
      title: `Order Placed: ${trade.asset_symbol} ${trade.direction.toUpperCase()}`,
      message: `Entry: ${trade.entry_price}, SL: ${trade.stop_loss}, TP1: ${trade.tp1}`,
      asset_symbol: trade.asset_symbol,
    });

    return Response.json({
      success: true,
      validation_mode: false,
      order_id: order.id,
      kraken_txid: krakenOrderId,
      message: 'Live order submitted to Kraken successfully.',
    });

  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});