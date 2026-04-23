# Trade Approval Workflow & Kraken Execution

## Overview

The Trade Approval Workflow enables a semi-automated trading flow where AI agents can propose trades, but execution requires explicit user approval before orders are sent to Kraken.

**Flow:**
1. **Market Watcher** detects a market setup
2. **Risk Manager** validates whether the trade passes safety checks
3. **Trade Planner** creates a structured trade plan with entry, stops, and targets
4. **Alert Agent** sends a notification to the user
5. User opens **Trade Approval screen** to review all trade details
6. User **approves or rejects** the trade
7. If approved, order is **sent to Kraken** via API
8. Order status is **tracked and updated** in real-time

## Data Model

### TradeApproval Entity

Represents a proposed trade awaiting user approval.

**Key Fields:**
- `asset_symbol` - E.g., "BTC", "ETH"
- `direction` - "buy" or "sell"
- `entry_price` - Suggested entry price
- `stop_loss` - Risk protection level
- `tp1`, `tp2`, `tp3` - Take profit targets
- `position_size_pct` - % of portfolio to risk
- `estimated_risk` - USD amount at risk
- `estimated_reward` - USD amount potential gain
- `rr_ratio` - Reward/Risk ratio
- `confidence_score` - 0-100, AI confidence
- `risk_score` - 0-100, higher = riskier
- `summary` - Short rationale
- `detailed_rationale` - Full explanation
- `status` - pending | approved | rejected | sent | filled | partial | cancelled | failed
- `signal_id` - Reference to AISignal
- `exchange_order_id` - Reference to ExchangeOrder after sending

### ExchangeOrder Entity

Represents an order sent to Kraken.

**Key Fields:**
- `trade_approval_id` - Reference to TradeApproval
- `asset_symbol` - Trading pair symbol
- `direction` - buy or sell
- `order_type` - market | limit
- `quantity` - Amount to trade
- `status` - pending | sent | open | filled | partial_fill | cancelled | failed
- `exchange_order_id` - Kraken's order ID
- `sent_at` - When order was sent
- `filled_at` - When filled
- `filled_price` - Actual execution price
- `error_message` - If order failed

## User Interface

### Trade Approval Screen

Accessible at `/trade-approval` or `/trade-approval/:id`

**Displays:**
- Asset name and direction (buy/sell with color coding)
- Entry price prominently
- All price levels (SL, TP1, TP2, TP3)
- Risk & reward in USD
- Reward/Risk ratio
- Confidence and Risk scores with color coding
- Position size as % of portfolio
- Short summary and detailed rationale
- Validity status (passed safety checks?)
- Order execution status (if sent)

**User Actions:**
- **Approve & Execute** - Send order to Kraken
- **Reject Trade** - Mark as rejected
- Later versions: Edit small parameters (entry, SL, TP1)

### Dashboard Widget

Shows up to 5 pending trades on the Dashboard.
Quick access to review pending approvals.
Clicking a trade opens the full approval screen.

### Alert Notifications

When a trade approval is created, an Alert is generated.
Severity depends on whether trade passes validation:
- ✅ Passes all checks → Info severity
- ⚠️ Fails a check → Warning severity

## Safety Checks

Before execution, the system validates:

1. **Emergency Stop** - Is capital protection active?
2. **Confidence Threshold** - confidence_score >= min_confidence_threshold
3. **Risk Score Threshold** - risk_score <= max_risk_score_threshold
4. **Reward/Risk Ratio** - rr_ratio >= min_rr_ratio
5. **Max Open Positions** - count < max_open_positions
6. **Max Exposure** - single asset and altcoin exposure rules
7. **Asset Filters** - Is the asset blocked (memecoins, high-risk)?

If any check fails:
- Trade approval status → rejected
- Rejection reason → stored and displayed
- Alert created with warning severity
- Order is NOT sent

## Backend Functions

### createTradeApprovalFromSignal()

Called by Trade Planner agent.

**Inputs:**
- signal_id
- asset_symbol, asset_name
- direction, entry_price, stop_loss, tp1, tp2, tp3
- position_size_pct, estimated_risk, estimated_reward, rr_ratio
- confidence_score, risk_score
- summary, detailed_rationale

**Outputs:**
- approval_id
- is_valid (passes safety checks?)
- validity_reason

**Side Effects:**
- Creates TradeApproval record
- Creates Alert notification
- Logs to AuditLog

### executeTradeOnKraken()

Called when user approves a trade.

**Inputs:**
- trade_approval_id

**Validates:**
- Trade status is 'approved'
- All safety checks pass
- Kraken connection is available

**Execution:**
- Creates ExchangeOrder record (status: sent)
- Updates TradeApproval (status: sent, exchange_order_id)
- Logs to AuditLog
- Creates Alert notification

**Outputs:**
- success: true/false
- order_id
- error message if failed

**Production Notes:**
- Use OAuth connector for secure Kraken authentication
- Call Kraken REST API with user's access token
- Handle rate limits and connection errors
- Retry with exponential backoff on transient failures
- Store full API response for audit trail

## Safety & Security

### User Approval Required
- No orders sent without explicit user action
- Current version: Semi-auto only (no full automation)
- All executions require human confirmation

### Comprehensive Validation
- Safety checks run both at approval creation AND execution
- If settings change between proposal and execution, latest rules apply
- Invalid trades are rejected with clear reason

### Audit Trail
- Every trade proposal logged
- Every approval/rejection logged
- Every order placement logged
- Every execution status change logged
- Full Kraken API response stored for reconciliation

### Risk Management Rules
- Configurable limits in Risk Settings page
- Emergency stop can block all trading instantly
- Position limits prevent over-leverage
- Confidence thresholds prevent low-quality trades
- Asset filters block problematic tokens

## Integration with Agents

### Market Watcher
- Detects market setups via chart analysis
- Outputs signal with analysis
- No order execution capability

### Risk Manager
- Validates proposed trades against risk settings
- Can block trades that exceed limits
- Recommends position sizing

### Trade Planner
- Creates structured trade plan
- Calls `createTradeApprovalFromSignal()` function
- Outputs TradeApproval for user review

### Alert Agent
- Monitors new trade approvals
- Sends notifications to user
- Creates alerts for execution status changes

## Future Enhancements

1. **Parameter Editing** - Allow user to adjust entry/SL/TP before approval
2. **Auto-Execution** - Optional for trusted traders (with daily/monthly limits)
3. **Advanced Order Types** - OCO orders, scaling, DCA
4. **Position Management** - Exit current positions, trailing stops
5. **Mobile Push Notifications** - Real-time order status
6. **Webhook Retries** - Handle Kraken API failures gracefully
7. **Live Order Tracking** - Stream order updates via WebSocket
8. **Post-Trade Analysis** - P&L tracking and performance metrics

## Testing

### Unit Tests
- Safety check logic
- Trade approval creation
- Status transitions

### Integration Tests
- Full workflow (signal → approval → execution)
- Safety check failures
- Kraken API integration

### Manual Testing
1. Create trade approval via agent chat
2. View on dashboard widget
3. Open trade approval screen
4. Review all details
5. Approve trade
6. Verify order created in ExchangeOrder
7. Check audit log
8. Monitor alerts for execution updates

## Troubleshooting

**Trade approval not created:**
- Check trade planner agent output
- Verify safety checks passing
- Check audit log for errors

**Approval screen blank:**
- Verify trade_approval_id in URL
- Check browser console for API errors
- Ensure user has permission to view trade

**Order execution failed:**
- Check error_message in ExchangeOrder record
- Verify Kraken API connection
- Check if market conditions changed
- Verify position sizing calculation
- Review audit log for details

**Orders not appearing in Kraken:**
- Verify API response in ExchangeOrder.raw_response
- Check Kraken API rate limits
- Verify authentication token valid
- Check order parameters (pair symbol, amount)