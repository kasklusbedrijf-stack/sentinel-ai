/**
 * syncKrakenAccount
 * Fetches real account data from Kraken (balances + open orders)
 * and syncs them into PortfolioAsset records.
 * Source: Kraken private API — requires KRAKEN_API_KEY + KRAKEN_API_SECRET
 * Prices enriched from Asset DB (already synced from CoinGecko).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Kraken requires: base64( HMAC-SHA512( base64decode(secret), path + SHA256(nonce+postdata) ) )
async function krakenSign(path, nonce, postData, apiSecret) {
  const encoder = new TextEncoder();

  // Decode the base64 API secret
  const secretBin = Uint8Array.from(atob(apiSecret), c => c.charCodeAt(0));

  // SHA-256 of (nonce + postData)
  const sha256Input = encoder.encode(nonce + postData);
  const sha256Hash = await crypto.subtle.digest('SHA-256', sha256Input);

  // HMAC-SHA-512 key from secret
  const hmacKey = await crypto.subtle.importKey(
    'raw', secretBin,
    { name: 'HMAC', hash: 'SHA-512' },
    false, ['sign']
  );

  // Message = path bytes + SHA-256 hash bytes
  const pathBytes = encoder.encode(path);
  const msg = new Uint8Array(pathBytes.length + sha256Hash.byteLength);
  msg.set(pathBytes, 0);
  msg.set(new Uint8Array(sha256Hash), pathBytes.length);

  const sig = await crypto.subtle.sign('HMAC', hmacKey, msg);

  // base64 encode result
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function krakenPost(path, apiKey, apiSecret) {
  const nonce = Date.now().toString();
  const postData = `nonce=${nonce}`;
  const signature = await krakenSign(path, nonce, postData, apiSecret);

  const res = await fetch(`https://api.kraken.com${path}`, {
    method: 'POST',
    headers: {
      'API-Key': apiKey,
      'API-Sign': signature,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: postData,
  });
  return res.json();
}

// Maps Kraken asset codes → standard symbols
function krakenAssetToSymbol(krakenCode) {
  const map = {
    XBT: 'BTC', XXBT: 'BTC',
    ETH: 'ETH', XETH: 'ETH',
    XRP: 'XRP', XXRP: 'XRP',
    LTC: 'LTC', XLTC: 'LTC',
    SOL: 'SOL',
    ADA: 'ADA',
    DOT: 'DOT',
    LINK: 'LINK',
    MATIC: 'MATIC',
    AVAX: 'AVAX',
    DOGE: 'DOGE',
    SHIB: 'SHIB',
    UNI: 'UNI',
  };
  return map[krakenCode] || krakenCode.replace(/^[XZ]/, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = Deno.env.get('KRAKEN_API_KEY');
    const apiSecret = Deno.env.get('KRAKEN_API_SECRET');

    if (!apiKey || !apiSecret) {
      return Response.json({
        success: false,
        kraken_configured: false,
        error: 'Kraken API credentials not configured. Add KRAKEN_API_KEY and KRAKEN_API_SECRET in Settings → Environment Variables.',
      });
    }

    // ── 1. Fetch balances ──────────────────────────
    const balanceRes = await krakenPost('/0/private/Balance', apiKey, apiSecret);

    if (balanceRes.error?.length > 0) {
      return Response.json({
        success: false,
        kraken_configured: true,
        error: `Kraken balance error: ${balanceRes.error.join(', ')}`,
      });
    }

    const rawBalances = balanceRes.result || {};

    // ── 2. Fetch open orders ───────────────────────
    // Small delay to avoid nonce collision
    await new Promise(r => setTimeout(r, 50));
    const ordersRes = await krakenPost('/0/private/OpenOrders', apiKey, apiSecret);
    const openOrders = ordersRes.result?.open || {};

    // ── 3. Get current prices from Asset DB (synced from CoinGecko) ──
    const assetPrices = await base44.asServiceRole.entities.Asset.list('-market_cap', 100);
    const priceMap = Object.fromEntries(assetPrices.map(a => [a.symbol, a]));

    const now = new Date().toISOString();

    // ── 4. Sync balances → PortfolioAsset ─────────
    const existingPortfolio = await base44.asServiceRole.entities.PortfolioAsset.list('-updated_date', 100);
    const portfolioBySymbol = Object.fromEntries(existingPortfolio.map(p => [p.asset_symbol, p]));

    const syncedBalances = [];

    for (const [krakenCode, balanceStr] of Object.entries(rawBalances)) {
      const symbol = krakenAssetToSymbol(krakenCode);
      const quantity = parseFloat(balanceStr) || 0;

      // Skip dust, fiat, and stablecoins
      if (quantity <= 0.000001) continue;
      if (['EUR', 'USD', 'GBP', 'USDT', 'USDC', 'ZUSD', 'ZEUR'].includes(symbol)) continue;

      const assetInfo = priceMap[symbol];
      const currentPrice = assetInfo?.current_price || 0;
      const currentValue = quantity * currentPrice;
      const existing = portfolioBySymbol[symbol];
      const avgBuy = existing?.avg_buy_price || currentPrice;
      const unrealizedPnl = currentPrice > 0 && avgBuy > 0 ? (currentPrice - avgBuy) * quantity : 0;
      const unrealizedPnlPct = avgBuy > 0 ? ((currentPrice - avgBuy) / avgBuy) * 100 : 0;

      const record = {
        asset_symbol: symbol,
        asset_name: assetInfo?.name || existing?.asset_name || symbol,
        quantity,
        current_price: currentPrice,
        current_value: currentValue,
        unrealized_pnl: unrealizedPnl,
        unrealized_pnl_pct: unrealizedPnlPct,
        avg_buy_price: existing?.avg_buy_price || currentPrice,
        data_source: 'kraken',
        last_synced: now,
      };

      if (existing) {
        await base44.asServiceRole.entities.PortfolioAsset.update(existing.id, record);
      } else {
        await base44.asServiceRole.entities.PortfolioAsset.create(record);
      }

      syncedBalances.push({ symbol, quantity, currentValue });
    }

    // ── 5. Recalculate allocation % ────────────────
    const totalValue = syncedBalances.reduce((s, b) => s + b.currentValue, 0);
    if (totalValue > 0 && syncedBalances.length > 0) {
      const freshPortfolio = await base44.asServiceRole.entities.PortfolioAsset.list('-updated_date', 100);
      for (const asset of freshPortfolio) {
        if (asset.data_source === 'kraken' && asset.current_value != null) {
          await base44.asServiceRole.entities.PortfolioAsset.update(asset.id, {
            allocation_pct: (asset.current_value / totalValue) * 100,
          });
        }
      }
    }

    // ── 6. Parse open orders ───────────────────────
    const parsedOrders = [];
    for (const [orderId, orderData] of Object.entries(openOrders)) {
      const pair = orderData.descr?.pair || '';
      const symbol = pair.replace(/USD.*|EUR.*/g, '').replace(/^X/, '');
      parsedOrders.push({
        kraken_order_id: orderId,
        asset_symbol: symbol || pair,
        direction: orderData.descr?.type === 'buy' ? 'buy' : 'sell',
        entry_price: parseFloat(orderData.descr?.price) || 0,
        quantity: parseFloat(orderData.vol) || 0,
        filled_quantity: parseFloat(orderData.vol_exec) || 0,
        status: 'open',
        opened_at: new Date((orderData.opentm || 0) * 1000).toISOString(),
      });
    }

    return Response.json({
      success: true,
      kraken_configured: true,
      balances: syncedBalances,
      balance_count: syncedBalances.length,
      open_orders: parsedOrders,
      open_order_count: parsedOrders.length,
      total_portfolio_value_usd: totalValue,
      synced_at: now,
      source: 'Kraken private API',
    });

  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});