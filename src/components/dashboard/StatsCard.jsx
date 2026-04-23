import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, subtitle, trend, trendValue, icon: Icon, accent = false }) {
  const isUp = trendValue >= 0;

  return (
    <div className={`
      relative p-5 rounded-xl border bg-card overflow-hidden
      ${accent ? 'border-primary/30 bg-primary/5' : 'border-border'}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
          <div className="text-2xl font-bold text-foreground font-mono truncate">{value}</div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg flex-shrink-0 ml-3 ${accent ? 'bg-primary/15' : 'bg-muted'}`}>
            <Icon className={`w-5 h-5 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        )}
      </div>

      {trend !== undefined && trendValue !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {isUp
            ? <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            : <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          }
          <span className={`text-xs font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{trendValue?.toFixed(2)}%
          </span>
          <span className="text-xs text-muted-foreground">{trend}</span>
        </div>
      )}

      {/* Accent glow */}
      {accent && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      )}
    </div>
  );
}