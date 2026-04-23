import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trade_approval_id } = await req.json();

    if (!trade_approval_id) {
      return Response.json({ error: 'trade_approval_id required' }, { status: 400 });
    }

    // Fetch the trade approval
    const approvals = await base44.asServiceRole.entities.TradeApproval.filter({
      id: trade_approval_id,
    });

    if (!approvals || approvals.length === 0) {
      return Response.json({ error: 'Trade approval not found' }, { status: 404 });
    }

    const trade = approvals[0];

    // Validate status
    if (trade.status !== 'approved') {
      return Response.json(
        { error: 'Trade must be approved before execution' },
        { status: 400 }
      );
    }

    // Fetch risk settings for safety validation
    const riskSettings = await base44.asServiceRole.entities.RiskSettings.list(
      '-created_date',
      1
    );
    const settings = riskSettings?.[0];

    // Safety checks
    if (settings?.emergency_stop_active) {
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'rejected',
        rejection_reason: 'Emergency stop is active',
      });
      return Response.json(
        { success: false, error: 'Emergency stop is active' },
        { status: 403 }
      );
    }

    if (trade.confidence_score < (settings?.min_confidence_threshold || 65)) {
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'rejected',
        rejection_reason: `Confidence ${trade.confidence_score}% below threshold ${settings?.min_confidence_threshold}%`,
      });
      return Response.json(
        { success: false, error: 'Confidence threshold not met' },
        { status: 400 }
      );
    }

    if (trade.risk_score > (settings?.max_risk_score_threshold || 70)) {
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'rejected',
        rejection_reason: `Risk score ${trade.risk_score} exceeds threshold ${settings?.max_risk_score_threshold}`,
      });
      return Response.json(
        { success: false, error: 'Risk score exceeds threshold' },
        { status: 400 }
      );
    }

    if (settings?.block_memecoins && trade.asset_symbol.toUpperCase() === 'DOGE') {
      // Simple memecoin check (in production, check against Asset.category)
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'rejected',
        rejection_reason: 'Asset is blocked by risk settings',
      });
      return Response.json(
        { success: false, error: 'Asset is blocked' },
        { status: 400 }
      );
    }

    // Count open positions
    const openOrders = await base44.asServiceRole.entities.ExchangeOrder.filter({
      status: 'open',
    });
    if (
      openOrders &&
      openOrders.length >= (settings?.max_open_positions || 5)
    ) {
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'rejected',
        rejection_reason: `Max open positions (${settings?.max_open_positions}) reached`,
      });
      return Response.json(
        { success: false, error: 'Max open positions reached' },
        { status: 400 }
      );
    }

    // Get Kraken API credentials from environment
    const krakenApiKey = Deno.env.get('KRAKEN_API_KEY');
    const krakenApiSecret = Deno.env.get('KRAKEN_API_SECRET');

    if (!krakenApiKey || !krakenApiSecret) {
      return Response.json(
        { error: 'Kraken API credentials not configured' },
        { status: 500 }
      );
    }

    // Prepare Kraken order request
    const krakenPair = `${trade.asset_symbol.toUpperCase()}USD`;
    const orderType = trade.direction === 'buy' ? 'buy' : 'sell';
    const nonce = Date.now().toString();
    
    // Calculate position size (simplified: use 10% of portfolio per trade)
    const quantity = parseFloat(trade.position_size_pct || 1) / 100;

    // Build Kraken API request
    const krakenPayload = new URLSearchParams({
      nonce: nonce,
      ordertype: 'limit',
      type: orderType,
      pair: krakenPair,
      price: trade.entry_price.toString(),
      volume: quantity.toString(),
      starttm: '0',
      expiretm: '0',
      closetm: '0',
      deadline: '',
      userref: trade_approval_id,
      validate: 'true', // Validate first; change to 'false' for live execution
    });

    // Sign request with HMAC-SHA512
    const apiPath = '/0/private/AddOrder';
    const postData = krakenPayload.toString();
    
    const encoder = new TextEncoder();
    const pathHash = await crypto.subtle.digest('SHA-256', encoder.encode(postData));
    const messageHash = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(apiPath + postData)
    );

    // Create HMAC signature
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(krakenApiSecret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageHash);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Call Kraken API
    let krakenResponse;
    let krakenOrderId;
    try {
      const response = await fetch('https://api.kraken.com/0/private/AddOrder', {
        method: 'POST',
        headers: {
          'API-Key': krakenApiKey,
          'API-Sign': signatureHex,
        },
        body: postData,
      });

      krakenResponse = await response.json();

      if (!response.ok || krakenResponse.error?.length > 0) {
        const errorMsg = krakenResponse.error?.join(', ') || 'Unknown Kraken API error';
        await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
          status: 'failed',
          rejection_reason: `Kraken API error: ${errorMsg}`,
        });
        return Response.json(
          { success: false, error: `Kraken rejected order: ${errorMsg}` },
          { status: 400 }
        );
      }

      // Extract order ID from Kraken response
      if (krakenResponse.result?.txid?.length > 0) {
        krakenOrderId = krakenResponse.result.txid[0];
      }
    } catch (krakenError) {
      await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
        status: 'failed',
        rejection_reason: `Kraken connection error: ${krakenError.message}`,
      });
      return Response.json(
        { success: false, error: `Failed to reach Kraken: ${krakenError.message}` },
        { status: 500 }
      );
    }

    // Create order record in database
    const order = await base44.asServiceRole.entities.ExchangeOrder.create({
      trade_approval_id: trade_approval_id,
      asset_symbol: trade.asset_symbol,
      direction: trade.direction,
      order_type: 'limit',
      entry_price: trade.entry_price,
      quantity: quantity,
      stop_loss: trade.stop_loss,
      tp1: trade.tp1,
      tp2: trade.tp2,
      tp3: trade.tp3,
      exchange: 'kraken',
      exchange_order_id: krakenOrderId || 'pending',
      status: 'sent',
      sent_at: new Date().toISOString(),
      raw_response: JSON.stringify(krakenResponse.result || krakenResponse),
    });

    // Update trade approval status
    await base44.asServiceRole.entities.TradeApproval.update(trade_approval_id, {
      status: 'sent',
      exchange_order_id: order.id,
    });

    // Log audit event
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'order_placed',
      severity: 'info',
      details: `Trade order placed for ${trade.asset_symbol} (${trade.direction})`,
      asset_symbol: trade.asset_symbol,
      metadata: JSON.stringify({
        trade_approval_id,
        exchange_order_id: order.id,
        direction: trade.direction,
        entry_price: trade.entry_price,
      }),
    });

    // Create alert notification
    await base44.asServiceRole.entities.Alert.create({
      type: 'signal',
      severity: 'info',
      title: `Order Placed: ${trade.asset_symbol} ${trade.direction.toUpperCase()}`,
      message: `Entry: ${trade.entry_price}, SL: ${trade.stop_loss}, TP: ${trade.tp1}`,
      asset_symbol: trade.asset_symbol,
      related_signal_id: trade.signal_id,
    });

    return Response.json({
      success: true,
      order_id: order.id,
      message: 'Trade order sent successfully',
    });
  } catch (error) {
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
});