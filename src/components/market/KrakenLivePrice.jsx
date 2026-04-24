/**
 * KrakenLivePrice
 * Shows a live price from Kraken WebSocket with connection indicator.
 * Falls back to CoinGecko DB price if WS not connected.
 */
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function WsStatusDot({ status, className }) {
  const cfg = {
    connected:    { color: 'bg-green-400', pulse: true,  label: 'Kraken Live' },
    connecting:   { color: 'bg-yellow-400', pulse: false, label: 'Connecting…' },
    disconnected: { color: 'bg-muted-foreground', pulse: false, label: 'Offline' },
    error:        { color: 'bg-red-400', pulse: false, label: 'WS Error' },
  };
  const c = cfg[status] || cfg.disconnected;
  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', c.color, c.pulse && 'animate-pulse')} />
      <span className="text-xs text-muted-foreground">{c.label}</span>
    </span>
  );
}

/**
 * KrakenLivePriceBadge — compact badge to put next to a price display.
 * Shows WS source label + connection status.
 */
export function KrakenLivePriceBadge({ status }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium',
      status === 'connected'
        ? 'border-orange-500/20 bg-orange-500/5 text-orange-400'
        : 'border-border bg-muted/50 text-muted-foreground'
    )}>
      {status === 'connected' ? (
        <Wifi className="w-3 h-3" />
      ) : status === 'connecting' ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      Kraken {status === 'connected' ? 'Live' : status === 'connecting' ? '…' : 'WS'}
    </div>
  );
}

/**
 * LivePriceDisplay — shows price with flash animation on update.
 * Accepts wsPrice (from WS) and fallbackPrice (from DB).
 */
export function LivePriceDisplay({ wsPrice, fallbackPrice, className }) {
  const price = wsPrice ?? fallbackPrice;
  if (!price) return <span className={cn('font-mono', className)}>—</span>;
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: price < 1 ? 6 : 2 })}
    </span>
  );
}