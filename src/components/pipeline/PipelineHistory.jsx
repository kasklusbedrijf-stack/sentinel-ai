import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function parseJSON(str) {
  if (!str) return null;
  try { return typeof str === 'object' ? str : JSON.parse(str); } catch { return null; }
}

export default function PipelineHistory({ onSelect }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AgentPipeline.list('-created_date', 20).then(r => {
      setRecords(r);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">No pipeline runs yet.</div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map(rec => {
        const riskReview = parseJSON(rec.risk_review_result);
        const approved = riskReview?.approved_plans?.length ?? '—';
        const blocked = riskReview?.blocked_plans?.length ?? '—';

        return (
          <button
            key={rec.id}
            onClick={() => onSelect(rec)}
            className="w-full text-left flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
          >
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
              rec.status === 'completed' ? 'bg-primary/10' : rec.status === 'running' ? 'bg-yellow-500/10' : 'bg-destructive/10'
            )}>
              {rec.status === 'completed'
                ? <CheckCircle2 className="w-4 h-4 text-primary" />
                : rec.status === 'running'
                ? <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
                : <XCircle className="w-4 h-4 text-destructive" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {new Date(rec.created_date).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {rec.status === 'completed'
                  ? `${approved} approved · ${blocked} blocked`
                  : rec.status === 'running'
                  ? `Running — ${rec.step?.replace('_', ' ')}`
                  : 'Failed'
                }
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
}