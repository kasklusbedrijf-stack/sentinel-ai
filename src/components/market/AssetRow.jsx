import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SignalBadge } from '@/components/ui/signal-badge';
import { Link } from 'react-router-dom';
import CryptoIcon from '@/components/ui/CryptoIcon';

function PctChange({ value }) {
  if (value === undefined || value === null) return <span className="text-muted-foreground text-xs">—</span>;
  const isUp = value >= 0;
  return (
    <span className={`text-xs font-mono font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
      {isUp ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

function trendFromStatus(status) {
  if (!status) return null;
  if (status === 'strong_bullish' || status === 'bullish') return 'UP';
  if (status === 'strong_bearish' || status === 'bearish') return 'DOWN';
  return 'NEUTRAL';
}

export default function AssetRow({ asset, signal }) {
  // Support both old field names (price_change_*) and new CoinGecko field names (change_*)
  const change1h  = asset.change_1h  ?? asset.price_change_1h;
  const change24h = asset.change_24h ?? asset.price_change_24h;
  const change7d  = asset.change_7d  ?? asset.price_change_7d;
  const trend = trendFromStatus(asset.trend_status) || (asset.trend_1d === 'UP' ? 'UP' : asset.trend_1d === 'DOWN' ? 'DOWN' : 'NEUTRAL');
  const isLive = asset.data_source === 'coingecko';

  return (
    <Link to={`/asset/${asset.id}`}>
      <div className="flex items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer border-b border-border/50 last:border-0">
        {/* Symbol + icon */}
        <div className="flex items-center gap-2.5 flex-shrink-0 min-w-0 flex-1 sm:flex-none sm:w-32">
          <CryptoIcon symbol={asset.symbol} imageUrl={asset.image_url} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{asset.symbol}</span>
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" title="Live CoinGecko data" />}
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-[80px]">{asset.name}</div>
          </div>
        </div>

        {/* Price — always visible */}
        <div className="flex-shrink-0 text-right sm:text-left sm:w-28">
          <div className="text-sm font-mono font-semibold text-foreground">
            ${asset.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: asset.current_price > 1 ? 2 : 6 })}
          </div>
          {/* 24h change visible on mobile only */}
          <div className="sm:hidden">
            <PctChange value={change24h} />
          </div>
        </div>

        {/* Changes — sm and up */}
        <div className="hidden sm:flex gap-4 flex-1">
          <div className="w-16 text-center"><PctChange value={change1h} /></div>
          <div className="w-16 text-center"><PctChange value={change24h} /></div>
          <div className="w-16 text-center"><PctChange value={change7d} /></div>
        </div>

        {/* Trend */}
        <div className="hidden md:flex items-center gap-1 w-20 flex-shrink-0">
          {trend === 'UP' && <TrendingUp className="w-3.5 h-3.5 text-green-400" />}
          {trend === 'DOWN' && <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
          {trend === 'NEUTRAL' && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className={`text-xs font-medium capitalize ${
            trend === 'UP' ? 'text-green-400' : trend === 'DOWN' ? 'text-red-400' : 'text-muted-foreground'
          }`}>{trend?.toLowerCase()}</span>
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