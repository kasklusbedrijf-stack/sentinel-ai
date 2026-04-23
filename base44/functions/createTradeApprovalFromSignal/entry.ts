import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Called by Trade Planner agent after validation
 * Creates a TradeApproval from an AISignal for user review
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      signal_id,
      asset_symbol,
      asset_name,
      direction,
      entry_price,
      stop_loss,
      tp1,
      tp2,
      tp3,
      position_size_pct,
      estimated_risk,
      estimated_reward,
      rr_ratio,
      confidence_score,
      risk_score,
      summary,
      detailed_rationale,
    } = await req.json();

    // Validate required fields
    if (!signal_id || !asset_symbol || !direction || !entry_price || !stop_loss) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch risk settings for validation message
    const riskSettings = await base44.asServiceRole.entities.RiskSettings.list(
      '-created_date',
      1
    );
    const settings = riskSettings?.[0];

    // Determine validity
    let validity_reason = 'Trade meets all safety criteria';
    let isValid = true;

    if (settings?.emergency_stop_active) {
      validity_reason = 'WARNING: Emergency stop is active';
      isValid = false;
    }

    if (
      confidence_score <
      (settings?.min_confidence_threshold || 65)
    ) {
      validity_reason = `Confidence ${confidence_score}% below ${settings?.min_confidence_threshold}% threshold`;
      isValid = false;
    }

    if (risk_score > (settings?.max_risk_score_threshold || 70)) {
      validity_reason = `Risk score ${risk_score} exceeds ${settings?.max_risk_score_threshold} threshold`;
      isValid = false;
    }

    if (rr_ratio < (settings?.min_rr_ratio || 2)) {
      validity_reason = `R:R ratio ${rr_ratio?.toFixed(2)} below ${settings?.min_rr_ratio} minimum`;
      isValid = false;
    }

    // Create trade approval
    const approval = await base44.asServiceRole.entities.TradeApproval.create({
      signal_id,
      asset_symbol,
      asset_name,
      direction,
      entry_price,
      stop_loss,
      tp1,
      tp2,
      tp3,
      position_size_pct,
      estimated_risk,
      estimated_reward,
      rr_ratio,
      confidence_score,
      risk_score,
      summary,
      detailed_rationale,
      status: 'pending',
      validity_reason: isValid ? validity_reason : validity_reason,
    });

    // Create alert notification
    await base44.asServiceRole.entities.Alert.create({
      type: 'signal',
      severity: isValid ? 'info' : 'warning',
      title: `Trade Approval: ${asset_symbol} ${direction.toUpperCase()}`,
      message: `Entry ${entry_price} | SL ${stop_loss} | TP1 ${tp1} | Conf: ${confidence_score}%`,
      asset_symbol,
      related_signal_id: signal_id,
    });

    // Log to audit
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'signal_generated',
      severity: isValid ? 'info' : 'warning',
      details: `Trade approval created for ${asset_symbol} ${direction}`,
      asset_symbol,
      metadata: JSON.stringify({
        approval_id: approval.id,
        signal_id,
        valid: isValid,
      }),
    });

    return Response.json({
      success: true,
      approval_id: approval.id,
      is_valid: isValid,
      validity_reason,
    });
  } catch (error) {
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
});