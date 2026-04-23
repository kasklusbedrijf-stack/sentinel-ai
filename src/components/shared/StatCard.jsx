import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, className }) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
          {(subtitle || trendValue) && (
            <div className="flex items-center gap-2">
              {trendValue && (
                <span className={cn(
                  "text-xs font-medium font-mono",
                  isPositive && "text-green-400",
                  isNegative && "text-red-400",
                  !isPositive && !isNegative && "text-muted-foreground"
                )}>
                  {isPositive ? '+' : ''}{trendValue}
                </span>
              )}
              {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}