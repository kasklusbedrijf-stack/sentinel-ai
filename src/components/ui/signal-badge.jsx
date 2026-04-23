export function SignalBadge({ signal }) {
  const config = {
    BUY: { label: 'BUY', bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
    PARTIAL_BUY: { label: 'PARTIAL BUY', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    HOLD: { label: 'HOLD', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
    WAIT: { label: 'WAIT', bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border' },
    PARTIAL_SELL: { label: 'PARTIAL SELL', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
    SELL: { label: 'SELL', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  };
  const c = config[signal] || config.WAIT;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
}

export function PnlText({ value, suffix = '' }) {
  const isPositive = value >= 0;
  return (
    <span className={`font-mono font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      {isPositive ? '+' : ''}{value?.toFixed(2)}{suffix}
    </span>
  );
}

export function ScoreBar({ value, max = 100, colorClass }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = colorClass || (pct >= 65 ? 'bg-green-500' : pct >= 45 ? 'bg-yellow-500' : 'bg-red-500');
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-7 text-right">{Math.round(value)}</span>
    </div>
  );
}