import { Zap, BarChart3, Wifi } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MarketDataSourcesTab from '@/components/connections/MarketDataSourcesTab';
import ExchangeAccountsTab from '@/components/connections/ExchangeAccountsTab';
import WebSocketStatusTab from '@/components/connections/WebSocketStatusTab';

export default function Connections() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Data Sources & Connections</h1>
        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
          Manage market data, exchange accounts, and live price streaming
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 border border-border rounded-lg p-1">
          <TabsTrigger value="market" className="flex items-center gap-2 text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">Market Data</span>
            <span className="sm:hidden">Market</span>
          </TabsTrigger>
          <TabsTrigger value="exchange" className="flex items-center gap-2 text-xs sm:text-sm">
            <Zap className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">Exchange</span>
            <span className="sm:hidden">Account</span>
          </TabsTrigger>
          <TabsTrigger value="websocket" className="flex items-center gap-2 text-xs sm:text-sm">
            <Wifi className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">WebSocket</span>
            <span className="sm:hidden">Live</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="market" className="bg-card border border-border rounded-xl">
          <MarketDataSourcesTab />
        </TabsContent>

        <TabsContent value="exchange" className="bg-card border border-border rounded-xl">
          <ExchangeAccountsTab />
        </TabsContent>

        <TabsContent value="websocket" className="bg-card border border-border rounded-xl">
          <WebSocketStatusTab />
        </TabsContent>
      </Tabs>

      {/* Info Footer */}
      <div className="bg-secondary/30 border border-border rounded-xl p-4 text-xs text-muted-foreground space-y-2">
        <p><strong>How it works:</strong></p>
        <ul className="space-y-1 ml-3">
          <li>• <strong>Market Data:</strong> CoinGecko provides public market prices (sync on-demand)</li>
          <li>• <strong>Exchange Accounts:</strong> Kraken REST API syncs your balances and orders (30s polling for open orders)</li>
          <li>• <strong>WebSocket:</strong> Kraken WS v2 streams live prices in real-time (&lt;100ms latency)</li>
        </ul>
      </div>
    </div>
  );
}