import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, subtitle, trend, trendValue, icon: Icon, accent = false }) {
  const isUp = trendValue >= 0;

  return (
    <div className={`
      relative p-3 sm:p-5 rounded-xl border bg-card overflow-hidden
      ${accent ? 'border-primary/30 bg-primary/5' : 'border-border'}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 sm:mb-2">{title}</p>
          <div className="text-lg sm:text-2xl font-bold text-foreground font-mono truncate">{value}</div>
          {subtitle && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2 sm:p-2.5 rounded-lg flex-shrink-0 ml-2 sm:ml-3 ${accent ? 'bg-primary/15' : 'bg-muted'}`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        )}
      </div>

      {trend !== undefined && trendValue !== undefined && (
        <div className="flex items-center gap-1 sm:gap-1.5 mt-2 sm:mt-3">
          {isUp
            ? <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" />
            : <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
          }
          <span className={`text-[10px] sm:text-xs font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{trendValue?.toFixed(2)}%
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">{trend}</span>
        </div>
      )}

      {/* Accent glow */}
      {accent && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      )}
    </div>
  );
}