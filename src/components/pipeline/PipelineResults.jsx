import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Shield, BarChart2, Eye, ChevronDown, ChevronUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import CryptoIcon from '@/components/ui/CryptoIcon';

function parseJSON(str) {
  if (!str) return null;
  try { return typeof str === 'object' ? str : JSON.parse(str); } catch { return null; }
}

function DirectionBadge({ direction }) {
  const { t } = useAppPreferences();
  const isBuy = direction === 'buy';
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold',
      isBuy ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
    )}>
      {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isBuy ? t('pipeline_direction_buy') : t('pipeline_direction_sell')}
    </span>
  );
}

function ApprovedPlanCard({ plan }) {
  const [expanded, setExpanded] = useState(false);
  const { formatCurrency, t } = useAppPreferences();

  return (
    <div className="rounded-xl border border-green-500/20 bg-green-500/5 overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-3.5 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <CryptoIcon symbol={plan.symbol} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">{plan.symbol}</span>
              <DirectionBadge direction={plan.direction} />
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t('pipeline_entry_label')} {formatCurrency(plan.entry_price)} · RR {plan.rr_ratio?.toFixed(1)}:1 · {plan.confidence_score}% {t('pipeline_conf_label')}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-3 border-t border-green-500/10 pt-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: t('positions_stop_loss'), value: plan.stop_loss, color: 'text-red-400' },
              { label: t('positions_tp1'), value: plan.tp1, color: 'text-green-400' },
              { label: t('positions_tp2'), value: plan.tp2, color: 'text-green-400' },
            ].map(({ label, value, color }) => value ? (
              <div key={label} className="bg-card rounded-lg border border-border/50 p-2 text-center">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className={cn('text-xs font-mono font-bold', color)}>{formatCurrency(value)}</div>
              </div>
            ) : null)}
          </div>

          {plan.summary && (
            <p className="text-xs text-muted-foreground leading-relaxed">{plan.summary}</p>
          )}

          {plan.approval_reason && (
            <div className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/15">
              <div className="text-xs font-medium text-green-400 mb-0.5">{t('pipeline_why_approved')}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{plan.approval_reason}</p>
            </div>
          )}

          {plan.cautions?.length > 0 && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-yellow-400 mb-1">{t('pipeline_cautions')}</div>
                {plan.cautions.map((c, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{c}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlockedPlanCard({ plan }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-red-500/15 bg-red-500/5">
      <CryptoIcon symbol={plan.symbol} size="md" className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground">{plan.symbol}</span>
          {plan.direction && <DirectionBadge direction={plan.direction} />}
          <XCircle className="w-3.5 h-3.5 text-red-400" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{plan.block_reason}</p>
      </div>
    </div>
  );
}

export default function PipelineResults({ pipelineData, onReset, onViewApprovals }) {
  const { t } = useAppPreferences();
  const marketScan = parseJSON(pipelineData?.market_scan_result);
  const tradePlans = parseJSON(pipelineData?.trade_plans_result);
  const riskReview = parseJSON(pipelineData?.risk_review_result);

  const setups = marketScan?.shortlisted_setups || [];
  const approved = riskReview?.approved_plans || [];
  const blocked = riskReview?.blocked_plans || [];

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{setups.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{t('pipeline_setups_found')}</div>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
          <div className="text-xl font-bold text-green-400">{approved.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{t('pipeline_approved')}</div>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
          <div className="text-xl font-bold text-red-400">{blocked.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{t('pipeline_blocked')}</div>
        </div>
      </div>

      {marketScan?.scan_summary && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/15 bg-blue-500/5">
          <Eye className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-blue-400 mb-1">{t('pipeline_scan_summary_label')}</div>
            <p className="text-sm text-foreground leading-relaxed">{marketScan.scan_summary}</p>
          </div>
        </div>
      )}

      {tradePlans?.planning_summary && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/15 bg-green-500/5">
          <BarChart2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-green-400 mb-1">{t('pipeline_plan_summary_label')}</div>
            <p className="text-sm text-foreground leading-relaxed">{tradePlans.planning_summary}</p>
          </div>
        </div>
      )}

      {riskReview?.risk_summary && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/15 bg-yellow-500/5">
          <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-yellow-400 mb-1">{t('pipeline_risk_summary_label')}</div>
            <p className="text-sm text-foreground leading-relaxed">{riskReview.risk_summary}</p>
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-foreground">{t('pipeline_approved_for_review')}</h3>
            <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs">{approved.length}</Badge>
          </div>
          <div className="space-y-2">
            {approved.map((plan, i) => <ApprovedPlanCard key={i} plan={plan} />)}
          </div>
        </div>
      )}

      {blocked.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-foreground">{t('pipeline_blocked_by_risk')}</h3>
            <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-xs">{blocked.length}</Badge>
          </div>
          <div className="space-y-2">
            {blocked.map((plan, i) => <BlockedPlanCard key={i} plan={plan} />)}
          </div>
        </div>
      )}

      {approved.length === 0 && (
        <div className="p-5 rounded-xl border border-border bg-card text-center">
          <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm font-semibold text-foreground">{t('pipeline_no_plans_approved')}</div>
          <p className="text-xs text-muted-foreground mt-1">{t('pipeline_no_plans_desc')}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button variant="outline" onClick={onReset} className="flex-1">
          {t('pipeline_run_again')}
        </Button>
        {approved.length > 0 && (
          <Button onClick={onViewApprovals} className="flex-1 gap-2">
            {t('pipeline_review_approved')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="text-center text-xs text-muted-foreground pb-2">
        {t('pipeline_completed')} {pipelineData?.completed_at ? new Date(pipelineData.completed_at).toLocaleString() : ''}
      </div>
    </div>
  );
}