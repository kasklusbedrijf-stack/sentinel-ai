import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PriceChange({ value, showIcon = true, className }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  
  const isPositive = value > 0;
  const isNegative = value < 0;
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-mono text-sm font-medium",
      isPositive && "text-green-400",
      isNegative && "text-red-400",
      !isPositive && !isNegative && "text-muted-foreground",
      className
    )}>
      {showIcon && <Icon className="w-3 h-3" />}
      {isPositive ? '+' : ''}{value?.toFixed(2)}%
    </span>
  );
}