import { useKrakenTicker, symbolToKrakenPair } from '@/hooks/useKrakenTicker';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const COMMON_PAIRS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'MATIC/USD', 'LINK/USD'];

export default function WebSocketStatusTab() {
  // Subscribe to common pairs to show connection status
  const { prices, status } = useKrakenTicker(COMMON_PAIRS);

  const statusConfig = {
    connected: { color: 'bg-green-500/10 border-green-500/30', textColor: 'text-green-400', label: 'Connected', icon: Wifi },
    connecting: { color: 'bg-yellow-500/10 border-yellow-500/30', textColor: 'text-yellow-400', label: 'Connecting…', icon: Wifi },
    disconnected: { color: 'bg-muted border-border', textColor: 'text-muted-foreground', label: 'Disconnected', icon: WifiOff },
    error: { color: 'bg-red-500/10 border-red-500/30', textColor: 'text-red-400', label: 'WS Error', icon: AlertCircle },
  };

  const config = statusConfig[status] || statusConfig.disconnected;
  const Icon = config.icon;
  const activeSubscriptions = Object.keys(prices).length;

  return (
    <div className="space-y-6 py-6">
      {/* WS Status Card */}
      <div className={cn('rounded-xl p-5 sm:p-6 border', config.color)}>
        <div className="flex items-center gap-3 mb-4">
          <Icon className={cn('w-5 h-5', config.textColor)} />
          <div>
            <h3 className={cn('text-sm font-semibold', config.textColor)}>{config.label}</h3>
            <p className="text-xs text-muted-foreground">Kraken WebSocket v2</p>
          </div>
        </div>

        {status === 'connected' && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Subscriptions</span>
              <span className="font-mono font-semibold text-foreground">{activeSubscriptions} pairs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Update</span>
              <span className="text-xs text-muted-foreground">Real-time streaming</span>
            </div>
          </div>
        )}

        {status === 'disconnected' && (
          <p className="text-xs text-muted-foreground">
            WebSocket will auto-connect when you navigate to pages that use live prices (Positions, Asset Detail).
          </p>
        )}

        {status === 'error' && (
          <p className="text-xs text-red-400">
            Connection error. Will attempt to reconnect automatically every 5 seconds.
          </p>
        )}
      </div>

      {/* Subscriptions List */}
      {activeSubscriptions > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Active Subscriptions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(prices).map(([pair, data]) => (
              <div key={pair} className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{pair}</p>
                <p className="text-sm font-mono font-semibold text-foreground">
                  ${data.last?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-2 text-xs text-muted-foreground">
        <p><strong>Source:</strong> Kraken WebSocket v2 API (public, no authentication required)</p>
        <p><strong>Used By:</strong> Positions page, Asset Detail page for real-time price updates</p>
        <p><strong>Latency:</strong> &lt;100ms typically, updates streamed continuously</p>
        <p><strong>Fallback:</strong> If WS disconnects, UI falls back to CoinGecko cached prices</p>
        <p><strong>Auto-Reconnect:</strong> Enabled automatically every 5 seconds if connection fails</p>
      </div>
    </div>
  );
}