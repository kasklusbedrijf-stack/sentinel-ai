import React from 'react';
import { cn } from '@/lib/utils';

const signalStyles = {
  BUY: 'bg-green-400/10 text-green-400 border-green-400/20',
  PARTIAL_BUY: 'bg-green-400/10 text-green-400 border-green-400/20',
  HOLD: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  WAIT: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  PARTIAL_SELL: 'bg-red-400/10 text-red-400 border-red-400/20',
  SELL: 'bg-red-400/10 text-red-400 border-red-400/20',
};

const signalLabels = {
  BUY: 'BUY',
  PARTIAL_BUY: 'PARTIAL BUY',
  HOLD: 'HOLD',
  WAIT: 'WAIT',
  PARTIAL_SELL: 'PARTIAL SELL',
  SELL: 'SELL',
};

export default function SignalBadge({ signal, size = 'sm' }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-md border font-mono font-semibold uppercase",
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
      signalStyles[signal] || 'bg-muted text-muted-foreground border-border'
    )}>
      {signalLabels[signal] || signal}
    </span>
  );
}