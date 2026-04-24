import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SignalBadge from '../shared/SignalBadge';
import ScoreBar from '../shared/ScoreBar';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CryptoIcon from '@/components/ui/CryptoIcon';

export default function RecentSignals() {
  const { data: signals = [] } = useQuery({
    queryKey: ['signals-recent'],
    queryFn: () => base44.entities.AISignal.list('-created_date', 5),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground">Latest AI Signals</h3>
        <Link to="/signals" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {signals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No signals yet. AI agents will generate signals based on market analysis.</p>
      ) : (
        <div className="space-y-4">
          {signals.map(signal => (
            <div key={signal.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/20 transition-colors">
              <CryptoIcon symbol={signal.asset_symbol} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-foreground">{signal.asset_symbol}</span>
                  <SignalBadge signal={signal.signal_type} />
                </div>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">{signal.summary || 'No summary'}</p>
                <div className="mt-2">
                  <ScoreBar label="Confidence" value={signal.confidence_score} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}