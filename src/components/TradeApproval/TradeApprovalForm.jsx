/**
 * TradeApprovalForm Component
 * Handles trade display and action buttons (extracted from TradeApproval page)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, TrendingDown, DollarSign, Shield, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import OrderSizeCheck from './OrderSizeCheck';

export function TradeApprovalForm({
  trade,
  formatCurrency,
  t,
  busy,
  rejecting,
  uiPhase,
  isActionable,
  isExecuted,
  isRejected,
  onValidate,
  onExecute,
  onReject,
  statusMsg,
  orderCheck,        // structured data from backend response
  statusIsError,     // true when statusMsg is an error (not validated)
}) {
  return (
    <>
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
              <div className="text-xs text-muted-foreground">{t('trade_approval_entry_price')}</div>
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
              { label: t('signals_entry'), value: trade.entry_price, color: 'text-foreground', icon: DollarSign },
              { label: t('positions_stop_loss'), value: trade.stop_loss, color: 'text-red-400', icon: Shield },
              { label: t('positions_tp1'), value: trade.tp1, color: 'text-green-400', icon: TrendingUp },
              { label: t('positions_tp2'), value: trade.tp2, color: 'text-green-400', icon: TrendingUp },
              { label: t('positions_tp3'), value: trade.tp3, color: 'text-green-400', icon: TrendingUp },
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
              <div className="text-xs text-muted-foreground mb-1">{t('trade_approval_estimated_risk')}</div>
              <div className="text-lg font-bold text-red-400 font-mono">{formatCurrency(trade.estimated_risk)}</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">{t('trade_approval_estimated_reward')}</div>
              <div className="text-lg font-bold text-green-400 font-mono">{formatCurrency(trade.estimated_reward)}</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">{t('trade_approval_rr_ratio')}</div>
              <div className="text-lg font-bold text-primary font-mono">{trade.rr_ratio?.toFixed(2)}:1</div>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{t('trade_approval_confidence')}</div>
              <div className={cn('text-lg font-bold font-mono', trade.confidence_score >= 70 ? 'text-green-400' : 'text-yellow-400')}>
                {trade.confidence_score}%
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{t('trade_approval_risk_score')}</div>
              <div className={cn('text-lg font-bold font-mono', trade.risk_score <= 50 ? 'text-green-400' : trade.risk_score <= 70 ? 'text-yellow-400' : 'text-red-400')}>
                {trade.risk_score}
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{t('trade_approval_position_size')}</div>
              <div className="text-lg font-bold font-mono text-primary">{trade.position_size_pct?.toFixed(1)}%</div>
            </div>
            <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{t('trade_approval_direction')}</div>
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
                <div className="text-sm font-medium text-foreground">{t('trade_approval_validation')}</div>
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
          uiPhase === 'validated'
            ? 'bg-green-500/5 border-green-500/30'
            : statusIsError
            ? 'bg-destructive/5 border-destructive/30'
            : 'bg-blue-500/5 border-blue-500/30'
        )}>
          {uiPhase === 'validated'
            ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            : <AlertCircle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', statusIsError ? 'text-destructive' : 'text-blue-400')} />
          }
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{statusMsg}</p>
        </div>
      )}

      {/* Order Status (if sent) */}
      {isExecuted && (
        <Card className="bg-green-500/5 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm font-semibold text-foreground">{t('trade_approval_order_submitted')}</div>
                <div className="text-xs text-muted-foreground">{t('trade_approval_check_alerts')}</div>
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

      {/* Kraken Order Size Check — always visible for non-executed trades */}
      {!isExecuted && !isRejected && (
        <OrderSizeCheck trade={trade} orderCheck={orderCheck} />
      )}

      {/* Actions */}
      {isActionable && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onReject}
            disabled={rejecting || busy}
            variant="outline"
            className="sm:flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            {rejecting ? t('trade_approval_rejecting') : t('trade_approval_reject')}
          </Button>

          {uiPhase !== 'validated' && (
            <Button
              onClick={onValidate}
              disabled={busy}
              className="sm:flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
            >
              {busy ? t('trade_approval_validating') : t('trade_approval_validate')}
            </Button>
          )}

          {uiPhase === 'validated' && (
            <Button
              onClick={onExecute}
              disabled={busy}
              className="sm:flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
            >
              {busy ? t('trade_approval_submitting') : t('trade_approval_execute_live')}
            </Button>
          )}
        </div>
      )}

      {isRejected && (
        <div className="p-4 bg-destructive/5 border border-destructive/30 rounded-lg text-center">
          <p className="text-sm text-destructive">{t('trade_approval_rejected_on')}{trade.rejected_at ? ` ${new Date(trade.rejected_at).toLocaleString()}` : ''}</p>
          {trade.rejection_reason && <p className="text-xs text-muted-foreground mt-1">{trade.rejection_reason}</p>}
        </div>
      )}
    </>
  );
}