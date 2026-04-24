/**
 * syncCoinGeckoMarket
 * Fetches live market data from CoinGecko (public API, no key needed for basic tier)
 * and upserts Asset records in the database.
 * Source: CoinGecko /coins/markets endpoint
 * Safe to call on-demand or via scheduler.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Maps CoinGecko coin IDs to our app's symbols and categories
const COIN_CONFIG = [
  { id: 'bitcoin',          symbol: 'BTC',   name: 'Bitcoin',          category: 'layer1' },
  { id: 'ethereum',         symbol: 'ETH',   name: 'Ethereum',         category: 'layer1' },
  { id: 'solana',           symbol: 'SOL',   name: 'Solana',           category: 'layer1' },
  { id: 'binancecoin',      symbol: 'BNB',   name: 'BNB',              category: 'layer1' },
  { id: 'ripple',           symbol: 'XRP',   name: 'XRP',              category: 'layer1' },
  { id: 'cardano',          symbol: 'ADA',   name: 'Cardano',          category: 'layer1' },
  { id: 'avalanche-2',      symbol: 'AVAX',  name: 'Avalanche',        category: 'layer1' },
  { id: 'polkadot',         symbol: 'DOT',   name: 'Polkadot',         category: 'layer1' },
  { id: 'chainlink',        symbol: 'LINK',  name: 'Chainlink',        category: 'defi' },
  { id: 'uniswap',          symbol: 'UNI',   name: 'Uniswap',          category: 'defi' },
  { id: 'aave',             symbol: 'AAVE',  name: 'Aave',             category: 'defi' },
  { id: 'the-graph',        symbol: 'GRT',   name: 'The Graph',        category: 'ai' },
  { id: 'render-token',     symbol: 'RENDER',name: 'Render',           category: 'ai' },
  { id: 'fetch-ai',         symbol: 'FET',   name: 'Fetch.ai',         category: 'ai' },
  { id: 'near',             symbol: 'NEAR',  name: 'NEAR Protocol',    category: 'layer1' },
  { id: 'polygon',          symbol: 'MATIC', name: 'Polygon',          category: 'layer2' },
  { id: 'arbitrum',         symbol: 'ARB',   name: 'Arbitrum',         category: 'layer2' },
  { id: 'optimism',         symbol: 'OP',    name: 'Optimism',         category: 'layer2' },
  { id: 'dogecoin',         symbol: 'DOGE',  name: 'Dogecoin',         category: 'meme' },
  { id: 'shiba-inu',        symbol: 'SHIB',  name: 'Shiba Inu',        category: 'meme' },
];

// Simple RSI estimation based on 24h/7d change as proxy (real RSI needs OHLC series)
function estimateRsi(change24h, change7d) {
  // Rough heuristic: if asset is up a lot short-term, RSI is elevated
  const combined = (change24h || 0) * 0.7 + (change7d || 0) * 0.3;
  return Math.max(20, Math.min(85, 50 + combined * 1.2));
}

function deriveTrendStatus(change24h, change7d) {
  const avg = ((change24h || 0) + (change7d || 0)) / 2;
  if (avg > 5) return 'strong_bullish';
  if (avg > 1.5) return 'bullish';
  if (avg < -5) return 'strong_bearish';
  if (avg < -1.5) return 'bearish';
  return 'neutral';
}

function deriveMacdSignal(change1h, change24h) {
  if ((change1h || 0) > 0.5 && (change24h || 0) > 0) return 'bullish';
  if ((change1h || 0) < -0.5 && (change24h || 0) < 0) return 'bearish';
  return 'neutral';
}

function deriveVolatility(priceChangeAbsPct, volume, marketCap) {
  const volRatio = marketCap > 0 ? volume / marketCap : 0;
  const base = Math.abs(priceChangeAbsPct || 0) * 5 + volRatio * 20;
  return Math.max(5, Math.min(95, base));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const coinIds = COIN_CONFIG.map(c => c.id).join(',');
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h,7d`;

    // Optional: CoinGecko Pro API key for higher rate limits
    const cgApiKey = Deno.env.get('COINGECKO_API_KEY');
    const headers = { 'Accept': 'application/json' };
    if (cgApiKey) headers['x-cg-pro-api-key'] = cgApiKey;

    const cgRes = await fetch(url, { headers });

    if (cgRes.status === 429) {
      return Response.json({
        success: false,
        error: 'CoinGecko rate limit hit. Wait 60 seconds before syncing again. For higher limits, add a COINGECKO_API_KEY in Settings.',
        rate_limited: true,
      }, { status: 200 }); // 200 so frontend handles gracefully
    }

    if (!cgRes.ok) {
      const errorText = await cgRes.text();
      return Response.json({ success: false, error: `CoinGecko error ${cgRes.status}: ${errorText}` }, { status: 502 });
    }

    const cgData = await cgRes.json();

    if (!Array.isArray(cgData) || cgData.length === 0) {
      return Response.json({ success: false, error: 'CoinGecko returned empty data' }, { status: 502 });
    }

    // Build a map from CoinGecko ID → our config
    const configMap = Object.fromEntries(COIN_CONFIG.map(c => [c.id, c]));

    // Fetch existing assets from DB to decide create vs update
    const existingAssets = await base44.asServiceRole.entities.Asset.list('-market_cap', 100);
    const existingBySymbol = Object.fromEntries(existingAssets.map(a => [a.symbol, a]));

    const now = new Date().toISOString();
    const updated = [];
    const created = [];
    const errors = [];

    for (const coin of cgData) {
      const cfg = configMap[coin.id];
      if (!cfg) continue;

      const change1h = coin.price_change_percentage_1h_in_currency || 0;
      const change24h = coin.price_change_percentage_24h || 0;
      const change7d = coin.price_change_percentage_7d_in_currency || 0;
      const price = coin.current_price || 0;
      const rsi = estimateRsi(change24h, change7d);
      const trend = deriveTrendStatus(change24h, change7d);
      const macd = deriveMacdSignal(change1h, change24h);
      const volatility = deriveVolatility(change24h, coin.total_volume, coin.market_cap);

      // Estimate support/resistance from 24h low/high
      const support = coin.low_24h || price * 0.97;
      const resistance = coin.high_24h || price * 1.03;

      // Simple EMA proxies (not true EMAs without historical data)
      const ema20 = price * (1 - change24h / 200);
      const ema50 = price * (1 - change7d / 200);
      const ema200 = price * (1 - (change7d * 4) / 200);

      const assetData = {
        symbol: cfg.symbol,
        name: cfg.name,
        category: cfg.category,
        current_price: price,
        change_1h: change1h,
        change_24h: change24h,
        change_7d: change7d,
        volume_24h: coin.total_volume || 0,
        market_cap: coin.market_cap || 0,
        rsi: Math.round(rsi * 10) / 10,
        trend_status: trend,
        macd_signal: macd,
        volatility: Math.round(volatility),
        support_level: support,
        resistance_level: resistance,
        ema_20: ema20,
        ema_50: ema50,
        ema_200: ema200,
        image_url: coin.image || '',
        data_source: 'coingecko',
        last_synced: now,
      };

      try {
        const existing = existingBySymbol[cfg.symbol];
        if (existing) {
          await base44.asServiceRole.entities.Asset.update(existing.id, assetData);
          updated.push(cfg.symbol);
        } else {
          await base44.asServiceRole.entities.Asset.create(assetData);
          created.push(cfg.symbol);
        }
      } catch (e) {
        errors.push({ symbol: cfg.symbol, error: e.message });
      }
    }

    return Response.json({
      success: true,
      updated_count: updated.length,
      created_count: created.length,
      updated_symbols: updated,
      created_symbols: created,
      errors,
      synced_at: now,
      source: 'CoinGecko /coins/markets',
    });

  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});