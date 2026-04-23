import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const krakenApiKey = Deno.env.get('KRAKEN_API_KEY');
    const krakenApiSecret = Deno.env.get('KRAKEN_API_SECRET');

    if (!krakenApiKey || !krakenApiSecret) {
      return Response.json(
        { error: 'Kraken API credentials not configured' },
        { status: 500 }
      );
    }

    // Fetch Kraken balances
    const nonce = Date.now().toString();
    const apiPath = '/0/private/Balance';
    const postData = `nonce=${nonce}`;

    const encoder = new TextEncoder();
    const messageHash = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(apiPath + postData)
    );

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

    const response = await fetch('https://api.kraken.com/0/private/Balance', {
      method: 'POST',
      headers: {
        'API-Key': krakenApiKey,
        'API-Sign': signatureHex,
      },
      body: postData,
    });

    const krakenResponse = await response.json();

    if (!response.ok || krakenResponse.error?.length > 0) {
      const errorMsg = krakenResponse.error?.join(', ') || 'Unknown error';
      return Response.json(
        { success: false, error: `Kraken API error: ${errorMsg}` },
        { status: 400 }
      );
    }

    // Process balances and update portfolio
    const balances = krakenResponse.result || {};
    const portfolio = [];

    for (const [assetCode, balance] of Object.entries(balances)) {
      // Map Kraken asset codes to symbols (e.g., XBT -> BTC, ZEUR -> EUR)
      const symbol = assetCode === 'XBT' ? 'BTC' : assetCode.replace(/^Z/, '').replace(/^X/, '');
      const amount = parseFloat(balance);

      if (amount > 0) {
        portfolio.push({
          asset_symbol: symbol,
          quantity: amount,
        });
      }
    }

    return Response.json({
      success: true,
      balances: portfolio,
      raw_response: krakenResponse.result,
    });
  } catch (error) {
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
});