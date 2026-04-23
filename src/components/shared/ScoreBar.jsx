import React from 'react';
import { cn } from '@/lib/utils';

export default function ScoreBar({ label, value, max = 100, showValue = true, size = 'sm' }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? 'bg-green-400' : pct >= 40 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="space-y-1">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showValue && <span className="text-xs font-mono font-medium text-foreground">{value}</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}