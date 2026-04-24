import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, AlertCircle, CheckCircle2, Clock, TrendingUp, TrendingDown, DollarSign, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { cn } from '@/lib/utils';

export default function TradeApproval({ tradeApprovalId, onBack }) {
  const { formatCurrency, t } = useAppPreferences();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  // 'idle' | 'validated' | 'sent' | 'rejected'
  const [uiPhase, setUiPhase] = useState('idle');
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    const loadTrade = async () => {
      if (tradeApprovalId) {
        const found = await base44.entities.TradeApproval.filter({ id: tradeApprovalId });
        if (found.length > 0) setTrade(found[0]);
      } else {
        const data = await base44.entities.TradeApproval.list('-created_date', 1);
        if (data.length > 0) setTrade(data[0]);
      }
      setLoading(false);
    };
    loadTrade();
  }, [tradeApprovalId]);

  // Step 1: mark approved + call backend in validate-only mode
  const handleValidate = async () => {
    if (!trade) return;
    setBusy(true);
    setStatusMsg(null);
    try {
      // Mark as approved (idempotent — safe to re-call if already approved)
      if (trade.status === 'pending') {
        await base44.entities.TradeApproval.update(trade.id, {
          status: 'approved',
          approved_at: new Date().toISOString(),
        });
        setTrade(prev => ({ ...prev, status: 'approved' }));
      }

      const result = await base44.functions.invoke('executeTradeOnKraken', {
        trade_approval_id: trade.id,
        validation_only: true,   // explicit: Kraken validate=true, no order created
      });

      if (result.data.success) {
        setUiPhase('validated');
        setStatusMsg('✓ Kraken accepted the order parameters. Click "Execute Live" to submit the real order.');
      } else {
        setStatusMsg(`Validation failed: ${result.data.error}`);
      }
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setBusy(false);
  };

  // Step 2: call backend in live mode — creates real Kraken order
  const handleExecuteLive = async () => {
    if (!trade) return;
    const confirmed = window.confirm(
      `⚠️ This will submit a REAL order to Kraken:\n\n` +
      `${trade.direction?.toUpperCase()} ${trade.asset_symbol} @ ${formatCurrency(trade.entry_price)}\n\n` +
      `Are you sure?`
    );
    if (!confirmed) return;

    setBusy(true);
    setStatusMsg(null);
    try {
      const result = await base44.functions.invoke('executeTradeOnKraken', {
        trade_approval_id: trade.id,
        validation_only: false,  // explicit: live submission
      });

      if (result.data.success) {
        setUiPhase('sent');
        setTrade(prev => ({ ...prev, status: 'sent', exchange_order_id: result.data.order_id }));
        setStatusMsg(`Order submitted. Kraken TX: ${result.data.kraken_txid || result.data.order_id}`);
      } else {
        setStatusMsg(`Execution failed: ${result.data.error}`);
      }
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setBusy(false);
  };

  const handleReject = async () => {
    if (!trade) return;
    setRejecting(true);
    try {
      await base44.entities.TradeApproval.update(trade.id, {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: 'User rejected trade',
      });
      setTrade(prev => ({ ...prev, status: 'rejected' }));
      setUiPhase('rejected');
    } catch (err) {
      console.error('Rejection failed:', err);
    }
    setRejecting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <p className="text-muted-foreground">{t('global_no_data')}</p>
      </div>
    );
  }

  const isExecuted = ['sent', 'filled', 'partial'].includes(trade.status) || uiPhase === 'sent';
  const isRejected = trade.status === 'rejected' || uiPhase === 'rejected';
  const isActionable = !isExecuted && !isRejected;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="p-1 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Trade Approval</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and approve before execution</p>
        </div>
        {isExecuted && <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Sent to Kraken</Badge>}
        {isRejected && <Badge className="bg-destructive/20 text-destructive border-destructive/30">Rejected</Badge>}
        {isActionable && uiPhase === 'idle' && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Test Mode</Badge>}
        {isActionable && uiPhase === 'validated' && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Ready to Execute</Badge>}
      </div>

      {/* Main Trade Summary */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0',
                trade.direction === 'buy' ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30'
              )}>
                {trade.direction === 'buy'
                  ? <TrendingUp className="w-6 h-6 text-green-400" />
                  : <TrendingDown className="w-6 h-6 text-red-400" />
                }
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{trade.asset_symbol}</div>
                <div className="text-sm text-muted-foreground">{trade.asset_name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Entry Price</div>
              <div className="text-2xl font-bold text-foreground font-mono">{formatCurrency(trade.entry_price)}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Trade Rationale */}
          {trade.summary && (
            <div className="p-4 bg-secondary/30 border border-border/50 rounded-lg">
              <p className="text-sm text-foreground leading-relaxed">{trade.summary}</p>
              {trade.detailed_rationale && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{trade.detailed_rationale}</p>
              )}
            </div>
          )}

          {/* Price Levels Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Entry', value: trade.entry_price, color: 'text-foreground', icon: DollarSign },
              { label: 'Stop Loss', value: trade.stop_loss, color: 'text-red-400', icon: Shield },
              { label: 'TP1', value: trade.tp1, color: 'text-green-400', icon: TrendingUp },
              { label: 'TP2', value: trade.tp2, color: 'text-green-400', icon: TrendingUp },
              { label: 'TP3', value: trade.tp3, color: 'text-green-400', icon: TrendingUp },
            ].map(({ label, value, color, icon: Icon }) => value ? (
              <div key={label} className="bg-card rounded-xl border border-border/50 p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <Icon className="w-3 h-3" /> {label}
                </div>
                <div className={cn('font-mono font-bold text-sm', color)}>{formatCurrency(value)}</div>
              </div>
            ) : null)}
          </div>

          {/* Risk & Reward */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Estimated Risk</div>
              <div className="text-lg font-bold text-red-400 font-mono">{formatCurrency(trade.estimated_risk)}</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Estimated Reward</div>
              <div className="text-lg font-bold text-green-400 font-mono">{formatCurrency(trade.estimated_reward)}</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">R:R Ratio</div>
              <div className="text-lg font-bold text-primary font-mono">{trade.rr_ratio?.toFixed(2)}:1</div>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Confidence</div>
              <div className={cn('text-lg font-bold font-mono', trade.confidence_score >= 70 ? 'text-green-400' : 'text-yellow-400')}>
                {trade.confidence_score}%
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
              <div className={cn('text-lg font-bold font-mono', trade.risk_score <= 50 ? 'text-green-400' : trade.risk_score <= 70 ? 'text-yellow-400' : 'text-red-400')}>
                {trade.risk_score}
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Position Size</div>
              <div className="text-lg font-bold font-mono text-primary">{trade.position_size_pct?.toFixed(1)}%</div>
            </div>
            <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Direction</div>
              <div className={cn('text-lg font-bold font-mono', trade.direction === 'buy' ? 'text-green-400' : 'text-red-400')}>
                {trade.direction?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Validity Status */}
          {trade.validity_reason && (
            <div className={cn(
              'p-4 rounded-lg border flex items-start gap-3',
              'bg-yellow-500/5 border-yellow-500/30'
            )}>
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-foreground">Trade Validation</div>
                <p className="text-xs text-muted-foreground mt-1">{trade.validity_reason}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status message */}
      {statusMsg && (
        <div className={cn(
          'p-4 rounded-lg border flex items-start gap-3',
          uiPhase === 'validated' ? 'bg-green-500/5 border-green-500/30' : 'bg-destructive/5 border-destructive/30'
        )}>
          {uiPhase === 'validated'
            ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          }
          <p className="text-sm text-foreground">{statusMsg}</p>
        </div>
      )}

      {/* Order Status (if sent) */}
      {isExecuted && (
        <Card className="bg-green-500/5 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm font-semibold text-foreground">Order submitted to Kraken</div>
                <div className="text-xs text-muted-foreground">Check Alerts for fill updates</div>
              </div>
            </div>
            {statusMsg && (
              <div className="text-xs text-muted-foreground font-mono bg-secondary/30 p-2 rounded border border-border/50">
                {statusMsg}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isActionable && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleReject}
            disabled={rejecting || busy}
            variant="outline"
            className="sm:flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            {rejecting ? 'Rejecting…' : 'Reject Trade'}
          </Button>

          {uiPhase !== 'validated' && (
            <Button
              onClick={handleValidate}
              disabled={busy}
              className="sm:flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
            >
              {busy ? 'Validating…' : 'Validate (Test Mode)'}
            </Button>
          )}

          {uiPhase === 'validated' && (
            <Button
              onClick={handleExecuteLive}
              disabled={busy}
              className="sm:flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
            >
              {busy ? 'Submitting…' : '⚡ Execute Live Order'}
            </Button>
          )}
        </div>
      )}

      {isRejected && (
        <div className="p-4 bg-destructive/5 border border-destructive/30 rounded-lg text-center">
          <p className="text-sm text-destructive">Trade rejected{trade.rejected_at ? ` on ${new Date(trade.rejected_at).toLocaleString()}` : ''}</p>
          {trade.rejection_reason && <p className="text-xs text-muted-foreground mt-1">{trade.rejection_reason}</p>}
        </div>
      )}
    </div>
  );
}