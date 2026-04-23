# Agent Integration Example - Trade Planner & Trade Approval

This document shows how AI agents (specifically Trade Planner) coordinate with the trade approval system.

## Trade Planner Agent Flow

### Step 1: Agent Analyzes Chart
User uploads a chart screenshot to Trade Planner agent.

```
User: "What do you think about this BTC setup?"
[uploads chart screenshot of BTC/USD from TradingView]
```

Trade Planner analyzes the screenshot and identifies:
- Clear support level at $45,000
- Rejection wicks showing strength
- Moving average alignment bullish
- Volume profile supporting move up

### Step 2: Agent Creates Trade Plan

Trade Planner outputs analysis:

```
**BTC/USD Analysis**

**Visible on Screenshot:**
- Asset/Pair: BTC/USD
- Timeframe: 4H
- Candle Structure: 3 green candles with acceptance closes, long lower wicks
- Price Action: Higher lows, support bounce at $45,000
- Volume: Increasing on up moves

**Market Structure**
The pullback to the support level established a clean bounce with follow-through buying. 
Price has reclaimed the 20-EMA with conviction. The pattern suggests strength.

**Suggested Trade Plan:**
- Direction: LONG (BUY)
- Entry: $45,200 (just above support)
- Stop Loss: $44,800 (below support level)
- TP1: $46,500 (first resistance)
- TP2: $47,800 (key resistance zone)
- TP3: $49,200 (extended target)
- Position Size: 2% of portfolio
- Risk: $800 (2% of $40,000 portfolio)
- Potential Reward: $3,200 (TP3)
- Risk/Reward Ratio: 1:4

**Confidence Score: 78%** (Strong bounce pattern, good structure)
**Risk Score: 35** (Low - solid support, tight stop)

**Summary**: Clean support bounce with follow-through. Entry offers favorable 1:4 RR on 4H timeframe.

**Detailed Rationale**: 
The price action on this 4H chart shows textbook support dynamics. The asset bounced 
off support with consecutive closes above the support level, indicating institutional 
buying. The 20-EMA confluence adds confluence. The tight stop (0.87% risk) relative 
to reward (7.2%) makes this an attractive trade.
```

### Step 3: Agent Creates Trade Approval

After analysis, Trade Planner calls backend function:

```javascript
// Inside Trade Planner agent
const approvalResponse = await base44.functions.invoke('createTradeApprovalFromSignal', {
  signal_id: 'signal_123',
  asset_symbol: 'BTC',
  asset_name: 'Bitcoin',
  direction: 'buy',
  entry_price: 45200,
  stop_loss: 44800,
  tp1: 46500,
  tp2: 47800,
  tp3: 49200,
  position_size_pct: 2,
  estimated_risk: 800,
  estimated_reward: 3200,
  rr_ratio: 4,
  confidence_score: 78,
  risk_score: 35,
  summary: 'Clean support bounce with follow-through buying',
  detailed_rationale: 'The price action on this 4H chart shows textbook support dynamics...'
});

// Response:
// {
//   success: true,
//   approval_id: 'approval_456',
//   is_valid: true,
//   validity_reason: 'Trade meets all safety criteria'
// }
```

### Step 4: System Creates Alert

When createTradeApprovalFromSignal succeeds:

```
Alert Created:
- Type: signal
- Severity: info (because trade passed validation)
- Title: "Trade Approval: BTC BUY"
- Message: "Entry 45200 | SL 44800 | TP1 46500 | Conf: 78%"
- Asset Symbol: BTC
- Related Signal: signal_123
```

### Step 5: User Sees Notification

User sees:
1. Alert in Alerts page
2. Pending trade widget on Dashboard
3. Can click either to open Trade Approval screen

### Step 6: User Reviews and Approves

User opens Trade Approval screen at `/trade-approval/approval_456`

**Screen shows:**
```
═══════════════════════════════════════════════════════════════════
                        TRADE APPROVAL
═══════════════════════════════════════════════════════════════════

[←] Trade Approval                                        [Pending]

┌─────────────────────────────────────────────────────────────────┐
│  📈  BTC          Entry Price: $45,200                          │
│  Bitcoin                                                         │
└─────────────────────────────────────────────────────────────────┘

Clean support bounce with follow-through buying. The price action on 
this 4H chart shows textbook support dynamics. The asset bounced off 
support with consecutive closes above...

┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Entry    │ Stop Loss│   TP1    │   TP2    │   TP3    │
│ $45,200  │ $44,800  │ $46,500  │ $47,800  │ $49,200  │
└──────────┴──────────┴──────────┴──────────┴──────────┘

┌──────────────┬────────────────┬──────────────────┐
│ Risk: $800   │ Reward: $3,200 │ R:R: 4.00:1      │
└──────────────┴────────────────┴──────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Confidence   │ Risk Score   │ Position Size│ Direction    │
│    78%       │     35       │    2.0%      │    BUY       │
└──────────────┴──────────────┴──────────────┴──────────────┘

✅ Trade Validation: Trade meets all safety criteria

[Reject Trade]  [Approve & Execute]
═══════════════════════════════════════════════════════════════════
```

### Step 7: User Clicks "Approve & Execute"

Frontend calls:

```javascript
const result = await base44.functions.invoke('executeTradeOnKraken', {
  trade_approval_id: 'approval_456'
});
```

Backend executes:

```
1. Check status = 'approved' ✓
2. Check emergency_stop_active = false ✓
3. Check confidence_score (78) >= min_confidence_threshold (65) ✓
4. Check risk_score (35) <= max_risk_score_threshold (70) ✓
5. Check rr_ratio (4.0) >= min_rr_ratio (2.0) ✓
6. Count open positions (3) < max_open_positions (5) ✓
7. Check BTC not in blocked_assets ✓

All checks passed! Proceeding with execution...

8. Create ExchangeOrder (status: sent)
   - trade_approval_id: approval_456
   - asset_symbol: BTC
   - direction: buy
   - entry_price: 45200
   - quantity: 0.088 (calculated from risk/position size)
   - stop_loss: 44800
   - tp1: 46500
   - tp2: 47800
   - tp3: 49200
   
9. Call Kraken API (via OAuth connector)
   POST /0/private/AddOrder
   {
     "ordertype": "limit",
     "type": "buy",
     "pair": "XBTUSDT",
     "price": 45200,
     "volume": 0.088,
     "starttm": 0,
     "expiretm": 0,
     "oflags": "post"
   }
   Response: { "txid": ["kraken_order_12345"], ... }

10. Store full response in ExchangeOrder.raw_response

11. Update TradeApproval:
    - status: 'sent'
    - exchange_order_id: 'kraken_order_12345'
    - sent_at: 2024-04-23T14:32:15Z

12. Create Alert (execution notification)
    - Type: signal
    - Title: "Order Placed: BTC BUY"
    - Severity: info

13. Log to AuditLog:
    - action: 'order_placed'
    - details: 'Trade order placed for BTC (buy)'
    - asset_symbol: BTC
    - metadata: { approval_id, order_id, ... }
```

### Step 8: Kraken Webhook Updates Status

When Kraken order fills:

```
Webhook received:
POST /webhook/kraken-order-status
{
  "order_id": "kraken_order_12345",
  "status": "filled",
  "filled_price": 45185,
  "filled_qty": 0.088,
  "timestamp": "2024-04-23T14:35:22Z"
}

Backend updates ExchangeOrder:
- status: 'filled'
- filled_price: 45185
- filled_quantity: 0.088
- filled_at: 2024-04-23T14:35:22Z

Creates Alert:
- Type: signal
- Severity: info
- Title: "Order Filled: BTC BUY"
- Message: "Filled at $45,185 for 0.088 BTC"
```

### Step 9: User Monitors Position

User can:
1. See filled order status on Trade Approval screen
2. Receive alert notification
3. View new position in Positions page
4. Monitor P&L in Dashboard
5. Set trailing stops or exit via UI

## Code Example for Custom Agent Integration

If you want to create a custom agent that creates approvals:

```python
# In an agent system (e.g., Claude)
import base44_sdk

def on_trade_plan_created(trade_plan):
    """Called when an agent finishes analyzing a trade."""
    
    # Validate trade plan has required fields
    required = ['asset', 'direction', 'entry', 'stop_loss', 'tp1', 'confidence']
    if not all(field in trade_plan for field in required):
        return {'error': 'Incomplete trade plan'}
    
    # Create approval via backend function
    response = await base44.functions.invoke('createTradeApprovalFromSignal', {
        'signal_id': trade_plan.get('signal_id'),
        'asset_symbol': trade_plan['asset'],
        'asset_name': trade_plan.get('asset_name', ''),
        'direction': trade_plan['direction'],
        'entry_price': trade_plan['entry'],
        'stop_loss': trade_plan['stop_loss'],
        'tp1': trade_plan.get('tp1'),
        'tp2': trade_plan.get('tp2'),
        'tp3': trade_plan.get('tp3'),
        'position_size_pct': trade_plan.get('position_size_pct', 2),
        'estimated_risk': trade_plan.get('estimated_risk'),
        'estimated_reward': trade_plan.get('estimated_reward'),
        'rr_ratio': trade_plan.get('rr_ratio'),
        'confidence_score': trade_plan['confidence'],
        'risk_score': trade_plan.get('risk_score', 50),
        'summary': trade_plan.get('summary', ''),
        'detailed_rationale': trade_plan.get('rationale', '')
    })
    
    if response['success']:
        print(f"✅ Trade approval created: {response['approval_id']}")
        print(f"   Valid: {response['is_valid']}")
        print(f"   Reason: {response['validity_reason']}")
        return {'approval_id': response['approval_id']}
    else:
        print(f"❌ Failed to create approval: {response.get('error')}")
        return {'error': response.get('error')}

# Example trade plan from agent analysis
trade_plan = {
    'signal_id': 'signal_123',
    'asset': 'ETH',
    'asset_name': 'Ethereum',
    'direction': 'buy',
    'entry': 2500,
    'stop_loss': 2450,
    'tp1': 2650,
    'tp2': 2800,
    'tp3': 2950,
    'position_size_pct': 1.5,
    'estimated_risk': 750,
    'estimated_reward': 3000,
    'rr_ratio': 4.0,
    'confidence': 72,
    'risk_score': 42,
    'summary': 'Bullish continuation after consolidation',
    'rationale': 'Price bounced from key support with volume...'
}

# Create the approval
result = await on_trade_plan_created(trade_plan)
```

## Error Scenarios

### Scenario 1: Trade Fails Confidence Check

```
Agent creates approval with confidence_score = 55
Min threshold = 65

Validity check fails:
- is_valid: false
- validity_reason: "Confidence 55% below 65% threshold"
- Alert severity: warning (not info)

User sees on screen:
⚠️ WARNING: Confidence 55% below 65% threshold
[Can still approve if they want, or reject]
```

### Scenario 2: Emergency Stop Active

```
User activated emergency stop
Trade Planner tries to create approval

Backend checks:
- emergency_stop_active: true

Rejection:
- is_valid: false  
- validity_reason: "Emergency stop is active"
- Status: rejected
- No approval created
- Alert severity: warning
- User needs to deactivate emergency stop first
```

### Scenario 3: Max Positions Reached

```
User already has 5 open positions
Max open positions = 5

Trade Planner creates approval:
- approval created and status: pending

User clicks "Approve & Execute"

executeTradeOnKraken checks:
- open_positions count = 5
- max_open_positions = 5
- Check fails!

Trade rejected:
- Trade approval status: rejected
- rejection_reason: "Max open positions (5) reached"
- No order sent
- Alert created: warning severity
- User must close a position first
```

## Summary

The Trade Approval Workflow enables:
- ✅ AI agents propose trades based on analysis
- ✅ Comprehensive validation before approval
- ✅ User review with full trade details
- ✅ Explicit user approval for every order
- ✅ Safe Kraken execution with final checks
- ✅ Real-time status tracking
- ✅ Complete audit trail

All while maintaining maximum control and safety.