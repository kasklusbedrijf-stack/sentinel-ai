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

    // In production: Connect to Kraken API using OAuth connector or API key
    // For now, simulate order creation
    const order = await base44.asServiceRole.entities.ExchangeOrder.create({
      trade_approval_id: trade_approval_id,
      asset_symbol: trade.asset_symbol,
      direction: trade.direction,
      order_type: 'limit',
      entry_price: trade.entry_price,
      quantity: 0.1, // In production: calculate from position size
      stop_loss: trade.stop_loss,
      tp1: trade.tp1,
      tp2: trade.tp2,
      tp3: trade.tp3,
      exchange: 'kraken',
      status: 'sent',
      sent_at: new Date().toISOString(),
      raw_response: JSON.stringify({
        simulated: true,
        note: 'Production: Call Kraken REST API with user OAuth token',
      }),
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