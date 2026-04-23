import { SignalBadge, ScoreBar } from '@/components/ui/signal-badge';
import { Target, Shield, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function SignalCard({ signal }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
          {signal.asset_symbol?.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">{signal.asset_symbol}</span>
            <SignalBadge signal={signal.signal_type} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{signal.summary}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-muted-foreground">Confidence</div>
          <div className={`text-lg font-mono font-bold ${
            signal.confidence_score >= 65 ? 'text-green-400' : signal.confidence_score >= 45 ? 'text-yellow-400' : 'text-red-400'
          }`}>{signal.confidence_score}%</div>
        </div>
      </div>

      {/* Scores */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Confidence
          </div>
          <ScoreBar value={signal.confidence_score} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Risk
          </div>
          <ScoreBar value={signal.risk_score} colorClass={signal.risk_score > 60 ? 'bg-red-500' : signal.risk_score > 35 ? 'bg-yellow-500' : 'bg-green-500'} />
        </div>
      </div>

      {/* Levels */}
      <div className="px-4 pb-3 grid grid-cols-3 gap-3 text-center">
        <div className="p-2 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground">Entry</div>
          <div className="text-xs font-mono font-bold text-foreground mt-0.5">
            ${signal.entry_price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-red-500/10">
          <div className="text-xs text-muted-foreground">Stop Loss</div>
          <div className="text-xs font-mono font-bold text-red-400 mt-0.5">
            ${signal.stop_loss?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-green-500/10">
          <div className="text-xs text-muted-foreground">TP1</div>
          <div className="text-xs font-mono font-bold text-green-400 mt-0.5">
            ${signal.take_profit_1?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* RR Ratio */}
      {signal.rr_ratio && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">R:R Ratio</span>
            <span className={`text-xs font-mono font-bold ${signal.rr_ratio >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
              1:{signal.rr_ratio?.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? 'Less' : 'Detailed Analysis'}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-muted/20 text-xs text-muted-foreground leading-relaxed border-t border-border/30">
          {signal.detailed_explanation || 'No detailed explanation available.'}
          <div className="mt-3 text-xs text-muted-foreground/60">
            {signal.created_date && formatDistanceToNow(new Date(signal.created_date), { addSuffix: true })}
          </div>
        </div>
      )}
    </div>
  );
}