import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PriceChange({ value, showIcon = true, className }) {
  if (value === undefined || value === null) return <span className="text-muted-foreground text-sm">—</span>;
  const isPos = value > 0;
  const isNeg = value < 0;
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-medium',
      isPos ? 'text-success' : isNeg ? 'text-destructive' : 'text-muted-foreground', className)}>
      {showIcon && (isPos ? <TrendingUp className="w-3 h-3" /> : isNeg ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />)}
      {isPos ? '+' : ''}{value?.toFixed(2)}%
    </span>
  );
}