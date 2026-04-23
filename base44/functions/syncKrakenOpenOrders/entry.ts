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

    // Fetch open orders from Kraken
    const nonce = Date.now().toString();
    const apiPath = '/0/private/OpenOrders';
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

    const response = await fetch('https://api.kraken.com/0/private/OpenOrders', {
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

    // Parse open orders
    const openOrders = krakenResponse.result?.open || {};
    const orders = [];

    for (const [orderId, orderData] of Object.entries(openOrders)) {
      const pair = orderData.descr?.pair || '';
      // Extract asset symbol from pair (e.g., XBTUSDT -> BTC, ETHUSDT -> ETH)
      const symbol = pair.replace(/USD.*$/, '').replace(/^X/, '');

      orders.push({
        kraken_order_id: orderId,
        asset_symbol: symbol,
        direction: orderData.descr?.type === 'buy' ? 'buy' : 'sell',
        entry_price: parseFloat(orderData.descr?.price),
        quantity: parseFloat(orderData.vol),
        filled_quantity: parseFloat(orderData.vol_exec || 0),
        status: 'open',
        opened_at: new Date(orderData.opentm * 1000).toISOString(),
      });
    }

    return Response.json({
      success: true,
      orders: orders,
      order_count: orders.length,
      raw_response: krakenResponse.result,
    });
  } catch (error) {
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
});