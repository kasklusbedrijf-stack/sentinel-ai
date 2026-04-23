import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SignalBadge } from '@/components/ui/signal-badge';
import { Link } from 'react-router-dom';

function PctChange({ value }) {
  if (value === undefined || value === null) return <span className="text-muted-foreground text-xs">—</span>;
  const isUp = value >= 0;
  return (
    <span className={`text-xs font-mono font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
      {isUp ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

export default function AssetRow({ asset, signal }) {
  const trend = asset.trend_1d;

  return (
    <Link to={`/asset/${asset.id}`}>
      <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer border-b border-border/50 last:border-0">
        {/* Symbol */}
        <div className="w-32 flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary">
            {asset.symbol?.slice(0, 2)}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{asset.symbol}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[80px]">{asset.name}</div>
          </div>
        </div>

        {/* Price */}
        <div className="w-28 flex-shrink-0">
          <div className="text-sm font-mono font-semibold text-foreground">
            ${asset.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </div>
        </div>

        {/* Changes */}
        <div className="hidden sm:flex gap-4 flex-1">
          <div className="w-16 text-center"><PctChange value={asset.price_change_1h} /></div>
          <div className="w-16 text-center"><PctChange value={asset.price_change_24h} /></div>
          <div className="w-16 text-center"><PctChange value={asset.price_change_7d} /></div>
        </div>

        {/* Trend */}
        <div className="hidden md:flex items-center gap-1 w-20 flex-shrink-0">
          {trend === 'UP' && <TrendingUp className="w-3.5 h-3.5 text-green-400" />}
          {trend === 'DOWN' && <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
          {trend === 'SIDEWAYS' && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className={`text-xs font-medium ${
            trend === 'UP' ? 'text-green-400' : trend === 'DOWN' ? 'text-red-400' : 'text-muted-foreground'
          }`}>{trend}</span>
        </div>

        {/* Signal */}
        <div className="hidden lg:block w-28 flex-shrink-0">
          {signal ? <SignalBadge signal={signal.signal_type} /> : <span className="text-xs text-muted-foreground">—</span>}
        </div>

        {/* RSI */}
        <div className="hidden xl:block w-16 text-right flex-shrink-0">
          {asset.rsi ? (
            <span className={`text-xs font-mono ${
              asset.rsi > 70 ? 'text-red-400' : asset.rsi < 30 ? 'text-green-400' : 'text-muted-foreground'
            }`}>{asset.rsi?.toFixed(0)}</span>
          ) : <span className="text-xs text-muted-foreground">—</span>}
        </div>
      </div>
    </Link>
  );
}