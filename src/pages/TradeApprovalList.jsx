import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, CheckCircle2, Clock, XCircle, TrendingUp, TrendingDown, ArrowRight, RefreshCw } from 'lucide-react';
import CryptoIcon from '@/components/ui/CryptoIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppPreferences } from '@/lib/AppPreferencesContext';

function StatusBadge({ status }) {
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
      <Clock className="w-2.5 h-2.5" /> Pending
    </span>
  );
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
      <CheckCircle2 className="w-2.5 h-2.5" /> Approved
    </span>
  );
  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
      <XCircle className="w-2.5 h-2.5" /> Rejected
    </span>
  );
  if (status === 'sent' || status === 'filled') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
      <CheckCircle2 className="w-2.5 h-2.5" /> Sent
    </span>
  );
  return (
    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full border border-border">{status}</span>
  );
}

function TradeCard({ trade, formatCurrency, onClick, actionable }) {
  const isBuy = trade.direction === 'buy';
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-colors flex items-center gap-3',
        actionable
          ? 'border-green-500/25 bg-green-500/5 active:bg-green-500/15'
          : 'border-border bg-card active:bg-secondary/70'
      )}
    >
      <div className="flex-shrink-0">
        <CryptoIcon symbol={trade.asset_symbol} size="md" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-foreground">{trade.asset_symbol}</span>
          <span className={cn(
            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold',
            isBuy ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
          )}>
            {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trade.direction?.toUpperCase()}
          </span>
          <StatusBadge status={trade.status} />
        </div>
        <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
          Entry {formatCurrency(trade.entry_price)}
          {trade.stop_loss ? ` · SL ${formatCurrency(trade.stop_loss)}` : ''}
          {trade.tp1 ? ` · TP1 ${formatCurrency(trade.tp1)}` : ''}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {trade.confidence_score}% conf · RR {trade.rr_ratio?.toFixed(1)}:1 · {trade.position_size_pct}% size
        </div>
      </div>
      <ArrowRight className={cn('w-4 h-4 flex-shrink-0', actionable ? 'text-green-400' : 'text-muted-foreground')} />
    </button>
  );
}

export default function TradeApprovalList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pipelineId = searchParams.get('pipeline_id');
  const { formatCurrency } = useAppPreferences();

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pipelineInfo, setPipelineInfo] = useState(null);

  const load = async () => {
    setLoading(true);
    let records = [];

    if (pipelineId) {
      // Query directly by pipeline_id — exact, reliable, no time-window heuristics
      records = await base44.entities.TradeApproval.filter({ pipeline_id: pipelineId }, '-created_date', 50);

      // Also fetch pipeline metadata for the info banner (may return empty if service-created — that's OK)
      try {
        const pipelines = await base44.entities.AgentPipeline.list('-created_date', 20);
        const match = pipelines.find(p => p.id === pipelineId);
        if (match) setPipelineInfo(match);
      } catch {}

      // If no records found by pipeline_id (old runs before schema change), fall back to time-window
      if (records.length === 0) {
        const all = await base44.entities.TradeApproval.list('-created_date', 50);
        if (all.length > 0) {
          const newestTime = new Date(all[0].created_date).getTime();
          records = all.filter(r => newestTime - new Date(r.created_date).getTime() < 3 * 60 * 1000);
        }
      }
    } else {
      // No pipeline_id: show all pending approvals
      records = await base44.entities.TradeApproval.filter({ status: 'pending' }, '-created_date', 50);
    }

    setTrades(records);
    setLoading(false);
  };

  useEffect(() => { load(); }, [pipelineId]);

  const pending = trades.filter(t => t.status === 'pending');
  const actioned = trades.filter(t => t.status !== 'pending');

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">Approved Trades</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pipelineId ? 'From this pipeline run' : 'All pending trade approvals'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {trades.length > 0 && (
            <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20">
              {pending.length} pending
            </Badge>
          )}
          <button
            onClick={load}
            className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pipeline info banner */}
      {pipelineInfo && (
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
          Pipeline completed {pipelineInfo.completed_at ? new Date(pipelineInfo.completed_at).toLocaleString() : '—'}
          {' · '}triggered by {pipelineInfo.triggered_by?.split('@')[0]}
          {' · '}<span className="text-primary font-medium">{trades.length} trade{trades.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : trades.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-semibold text-foreground">No trades found</p>
            <p className="text-xs text-muted-foreground mt-1">Run the pipeline to generate new trade approvals.</p>
          </div>
          <button
            onClick={() => navigate('/pipeline')}
            className="text-xs text-primary underline underline-offset-2"
          >
            Go to Pipeline →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Awaiting your review · {pending.length}
              </p>
              {pending.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  formatCurrency={formatCurrency}
                  onClick={() => navigate(`/trade-approval/${trade.id}`)}
                  actionable
                />
              ))}
            </div>
          )}

          {actioned.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Actioned · {actioned.length}
              </p>
              {actioned.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  formatCurrency={formatCurrency}
                  onClick={() => navigate(`/trade-approval/${trade.id}`)}
                  actionable={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}