import { useState } from 'react';
import LiveDataControls from '@/components/market/LiveDataControls';
import { AlertCircle } from 'lucide-react';

export default function MarketDataSourcesTab() {
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  return (
    <div className="space-y-6 py-6">
      {/* CoinGecko Overview */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">CoinGecko</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Public market data: prices, volumes, market cap, technical indicators, and coin metadata.
        </p>

        {/* Status and controls */}
        <div className="mb-4">
          <LiveDataControls
            lastSyncedAt={lastSyncedAt}
            onSynced={(data) => {
              setLastSyncedAt(data.synced_at);
            }}
          />
        </div>

        {/* Info box */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground space-y-2">
          <p><strong>Data Updated:</strong> Price changes (1h, 24h, 7d), volume, market cap, technical proxies (RSI, EMA, MACD, volatility, support/resistance)</p>
          <p><strong>Frequency:</strong> On-demand sync (no automatic polling)</p>
          <p><strong>Rate Limit:</strong> 10-50 calls/min (free tier). Higher with API key.</p>
          <p><strong>Assets:</strong> 22 hardcoded cryptocurrencies (BTC, ETH, SOL, etc.)</p>
        </div>
      </div>

      {/* Data Freshness Info */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-blue-400 mb-1">Market data is cached</p>
          <p>Last sync timestamp is displayed on the Market page and in price displays. Click "Sync Live" above to refresh immediately.</p>
        </div>
      </div>
    </div>
  );
}