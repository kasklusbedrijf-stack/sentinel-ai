import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, changeLabel, icon: Icon, iconColor = 'text-primary', subtitle }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-lg bg-secondary flex items-center justify-center')}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        )}
      </div>
      {(change !== undefined || subtitle) && (
        <div className="flex items-center gap-2">
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-success' : 'text-destructive')}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{change}%
            </div>
          )}
          <p className="text-xs text-muted-foreground">{changeLabel || subtitle}</p>
        </div>
      )}
    </div>
  );
}