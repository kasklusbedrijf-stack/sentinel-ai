import { cn } from '@/lib/utils';

export default function ScoreBar({ label, value, max = 100, colorFn }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = colorFn ? colorFn(value) : value >= 70 ? 'bg-success' : value >= 45 ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}