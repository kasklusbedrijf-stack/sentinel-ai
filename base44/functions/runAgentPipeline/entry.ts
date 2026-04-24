import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Create a pipeline record to track progress
    const pipeline = await base44.asServiceRole.entities.AgentPipeline.create({
      status: 'running',
      step: 'market_scan',
      started_at: new Date().toISOString(),
      triggered_by: user.email,
    });

    const pipelineId = pipeline.id;

    // ─────────────────────────────────────────────
    // STEP 1: MARKET WATCHER — scan available assets for setups
    // ─────────────────────────────────────────────
    const assets = await base44.asServiceRole.entities.Asset.list('-market_cap', 30);
    const existingSignals = await base44.asServiceRole.entities.AISignal.filter({ status: 'active' }, '-created_date', 20);
    const riskSettings = await base44.asServiceRole.entities.RiskSettings.list('-created_date', 1);
    const positions = await base44.asServiceRole.entities.Position.filter({ status: 'open' }, '-created_date', 10);

    const settings = riskSettings[0] || {};

    const assetSummary = assets.slice(0, 20).map(a => ({
      symbol: a.symbol,
      name: a.name,
      price: a.current_price,
      change_24h: a.change_24h,
      change_7d: a.change_7d,
      rsi: a.rsi,
      trend: a.trend_status,
      macd: a.macd_signal,
      volatility: a.volatility,
      volume_24h: a.volume_24h,
      support: a.support_level,
      resistance: a.resistance_level,
      category: a.category,
    }));

    const signalSummary = existingSignals.map(s => ({
      symbol: s.asset_symbol,
      type: s.signal_type,
      confidence: s.confidence_score,
      risk: s.risk_score,
      entry: s.suggested_entry,
      sl: s.suggested_stop_loss,
      tp1: s.suggested_tp1,
      rr: s.reward_risk_ratio,
    }));

    const marketWatcherPrompt = `You are Market Watcher, a senior crypto market analyst. Your job is to scan the available market data and shortlist the BEST 3-5 trade setups right now.

MARKET DATA (top 20 assets by market cap):
${JSON.stringify(assetSummary, null, 2)}

EXISTING AI SIGNALS:
${JSON.stringify(signalSummary, null, 2)}

OPEN POSITIONS (already active): ${positions.map(p => p.asset_symbol).join(', ') || 'None'}

RISK CONSTRAINTS:
- Max open positions: ${settings.max_open_positions || 5}
- Block memecoins: ${settings.block_memecoins ? 'Yes' : 'No'}
- Block high risk: ${settings.block_high_risk ? 'Yes' : 'No'}
- Min confidence threshold: ${settings.min_confidence_threshold || 65}%

YOUR TASK:
1. Identify 3-5 assets that show the best technical setup for a trade right now
2. For each asset explain WHY it's a good setup using the available data
3. Assign a setup quality score 0-100
4. Specify suggested direction (buy/sell)
5. EXCLUDE any asset already in open positions
6. EXCLUDE memecoins if block_memecoins is true

Return your response as a JSON object EXACTLY matching this schema, no extra text:
{
  "scan_summary": "2-3 sentence overview of current market conditions",
  "shortlisted_setups": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "direction": "buy",
      "setup_quality": 85,
      "rationale": "Explanation of why this is a good setup",
      "key_levels": {
        "current_price": 65000,
        "support": 63000,
        "resistance": 68000
      },
      "technical_signals": ["RSI oversold recovery", "MACD bullish crossover"],
      "risk_factors": ["High volatility", "Upcoming macro event"]
    }
  ]
}`;

    const marketScanResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: marketWatcherPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          scan_summary: { type: 'string' },
          shortlisted_setups: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string' },
                name: { type: 'string' },
                direction: { type: 'string' },
                setup_quality: { type: 'number' },
                rationale: { type: 'string' },
                key_levels: { type: 'object' },
                technical_signals: { type: 'array', items: { type: 'string' } },
                risk_factors: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    });

    // Save step 1 result and advance step
    await base44.asServiceRole.entities.AgentPipeline.update(pipelineId, {
      step: 'trade_planning',
      market_scan_result: JSON.stringify(marketScanResponse),
    });

    // ─────────────────────────────────────────────
    // STEP 2: TRADE PLANNER — turn setups into structured trade plans
    // ─────────────────────────────────────────────
    const setupsForPlanning = marketScanResponse.shortlisted_setups || [];

    const tradePlannerPrompt = `You are Trade Planner, a senior crypto trading strategist. You receive shortlisted market setups from Market Watcher and must build precise, executable trade plans for each.

SHORTLISTED SETUPS FROM MARKET WATCHER:
${JSON.stringify(setupsForPlanning, null, 2)}

FULL ASSET DATA (for price level reference):
${JSON.stringify(assetSummary.filter(a => setupsForPlanning.some(s => s.symbol === a.symbol)), null, 2)}

RISK RULES:
- Max risk per trade: ${settings.max_risk_per_trade_pct || 2}% of portfolio
- Min R:R ratio: ${settings.min_rr_ratio || 2}
- Min confidence threshold: ${settings.min_confidence_threshold || 65}%

YOUR TASK:
For each setup, create a precise trade plan with:
1. Entry price (limit order level, not market)
2. Stop loss (based on structure, not arbitrary)
3. TP1 (first take profit — conservative)
4. TP2 (second take profit — extended)
5. TP3 (third take profit — target, optional)
6. Position size recommendation (% of portfolio)
7. Confidence score 0-100
8. Risk score 0-100 (higher = riskier)
9. Short summary of the trade thesis
10. Estimated R:R ratio

Return ONLY this JSON, no extra text:
{
  "planning_summary": "Brief overview of the trade plans created",
  "trade_plans": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "direction": "buy",
      "entry_price": 64800,
      "stop_loss": 62500,
      "tp1": 67500,
      "tp2": 70000,
      "tp3": 74000,
      "position_size_pct": 2,
      "confidence_score": 78,
      "risk_score": 45,
      "rr_ratio": 2.4,
      "summary": "BTC shows strong support at 63k with bullish MACD crossover. Entry on slight pullback to 64.8k.",
      "detailed_rationale": "Extended rationale here."
    }
  ]
}`;

    const tradePlanResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: tradePlannerPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          planning_summary: { type: 'string' },
          trade_plans: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string' },
                name: { type: 'string' },
                direction: { type: 'string' },
                entry_price: { type: 'number' },
                stop_loss: { type: 'number' },
                tp1: { type: 'number' },
                tp2: { type: 'number' },
                tp3: { type: 'number' },
                position_size_pct: { type: 'number' },
                confidence_score: { type: 'number' },
                risk_score: { type: 'number' },
                rr_ratio: { type: 'number' },
                summary: { type: 'string' },
                detailed_rationale: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Save step 2 result and advance step
    await base44.asServiceRole.entities.AgentPipeline.update(pipelineId, {
      step: 'risk_review',
      trade_plans_result: JSON.stringify(tradePlanResponse),
    });

    // ─────────────────────────────────────────────
    // STEP 3: RISK MANAGER — filter plans against risk rules
    // ─────────────────────────────────────────────
    const plansForReview = tradePlanResponse.trade_plans || [];
    const openPositionSymbols = positions.map(p => p.asset_symbol);
    const openPositionCount = positions.length;

    const riskManagerPrompt = `You are Risk Manager, a senior crypto risk officer. Your job is to review trade plans created by Trade Planner and apply strict risk rules.

TRADE PLANS TO REVIEW:
${JSON.stringify(plansForReview, null, 2)}

CURRENT PORTFOLIO STATE:
- Open positions: ${openPositionCount} (max allowed: ${settings.max_open_positions || 5})
- Symbols already trading: ${openPositionSymbols.join(', ') || 'None'}

RISK RULES TO ENFORCE:
- Emergency stop active: ${settings.emergency_stop_active ? 'YES — BLOCK ALL' : 'No'}
- Min confidence: ${settings.min_confidence_threshold || 65}%
- Max risk score: ${settings.max_risk_score_threshold || 70}
- Min R:R ratio: ${settings.min_rr_ratio || 2}
- Max open positions: ${settings.max_open_positions || 5}
- Block memecoins: ${settings.block_memecoins ? 'Yes' : 'No'}
- Block high risk assets: ${settings.block_high_risk ? 'Yes' : 'No'}
- Max risk per trade: ${settings.max_risk_per_trade_pct || 2}%

YOUR TASK:
For each trade plan:
1. Check every rule above
2. Approve or block each plan
3. Explain clearly WHY each plan was approved or blocked (which specific rule)
4. For approved plans, note any conditions or cautions
5. Provide an overall risk assessment of the whole shortlist

IMPORTANT: Do NOT approve any plan if emergency stop is active.

Return ONLY this JSON, no extra text:
{
  "risk_summary": "Overall risk assessment paragraph",
  "approved_plans": [
    {
      "symbol": "BTC",
      "direction": "buy",
      "entry_price": 64800,
      "stop_loss": 62500,
      "tp1": 67500,
      "tp2": 70000,
      "tp3": 74000,
      "position_size_pct": 2,
      "confidence_score": 78,
      "risk_score": 45,
      "rr_ratio": 2.4,
      "summary": "Trade thesis summary",
      "approval_reason": "Why this plan passed all risk checks",
      "cautions": ["Any notes or cautions the user should be aware of"]
    }
  ],
  "blocked_plans": [
    {
      "symbol": "DOGE",
      "direction": "buy",
      "block_reason": "Blocked: Memecoin filter active",
      "rule_violated": "block_memecoins"
    }
  ]
}`;

    const riskReviewResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: riskManagerPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          risk_summary: { type: 'string' },
          approved_plans: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string' },
                direction: { type: 'string' },
                entry_price: { type: 'number' },
                stop_loss: { type: 'number' },
                tp1: { type: 'number' },
                tp2: { type: 'number' },
                tp3: { type: 'number' },
                position_size_pct: { type: 'number' },
                confidence_score: { type: 'number' },
                risk_score: { type: 'number' },
                rr_ratio: { type: 'number' },
                summary: { type: 'string' },
                approval_reason: { type: 'string' },
                cautions: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          blocked_plans: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string' },
                direction: { type: 'string' },
                block_reason: { type: 'string' },
                rule_violated: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Save final result
    await base44.asServiceRole.entities.AgentPipeline.update(pipelineId, {
      status: 'completed',
      step: 'done',
      risk_review_result: JSON.stringify(riskReviewResponse),
      completed_at: new Date().toISOString(),
    });

    // Create TradeApproval records for each approved plan (status: pending — awaiting user approval)
    for (const plan of (riskReviewResponse.approved_plans || [])) {
      await base44.asServiceRole.entities.TradeApproval.create({
        asset_symbol: plan.symbol,
        asset_name: plan.symbol,
        direction: plan.direction,
        entry_price: plan.entry_price,
        stop_loss: plan.stop_loss,
        tp1: plan.tp1,
        tp2: plan.tp2,
        tp3: plan.tp3,
        position_size_pct: plan.position_size_pct,
        confidence_score: plan.confidence_score,
        risk_score: plan.risk_score,
        rr_ratio: plan.rr_ratio,
        summary: plan.summary,
        detailed_rationale: plan.approval_reason,
        status: 'pending',
        validity_reason: (plan.cautions || []).join('; '),
      });
    }

    return Response.json({
      success: true,
      pipeline_id: pipelineId,
      market_scan: marketScanResponse,
      trade_plans: tradePlanResponse,
      risk_review: riskReviewResponse,
    });

  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});