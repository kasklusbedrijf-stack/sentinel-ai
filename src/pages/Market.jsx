import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AssetRow from '@/components/market/AssetRow';

const CATEGORIES = ['All', 'Layer1', 'Layer2', 'DeFi', 'AI', 'Meme', 'Stablecoin', 'Exchange', 'Other'];

export default function Market() {
  const [assets, setAssets] = useState([]);
  const [signals, setSignals] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('market_cap');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [a, s] = await Promise.all([
        base44.entities.Asset.list('-market_cap', 100),
        base44.entities.AISignal.filter({ status: 'ACTIVE' }, '-created_date', 100),
      ]);
      setAssets(a);
      setSignals(s);
      setLoading(false);
    }
    load();
  }, []);

  const signalMap = signals.reduce((m, s) => ({ ...m, [s.asset_symbol]: s }), {});

  const filtered = assets
    .filter(a => {
      const matchSearch = a.symbol?.toLowerCase().includes(search.toLowerCase()) ||
        a.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || a.category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'change_24h') return (b.price_change_24h || 0) - (a.price_change_24h || 0);
      if (sortBy === 'change_7d') return (b.price_change_7d || 0) - (a.price_change_7d || 0);
      if (sortBy === 'volume') return (b.volume_24h || 0) - (a.volume_24h || 0);
      return (b.market_cap || 0) - (a.market_cap || 0);
    });

  const gainers = [...assets].sort((a, b) => (b.price_change_24h || 0) - (a.price_change_24h || 0)).slice(0, 3);
  const losers = [...assets].sort((a, b) => (a.price_change_24h || 0) - (b.price_change_24h || 0)).slice(0, 3);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Market Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live prices, trends and AI signals</p>
      </div>

      {/* Gainers / Losers */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">Top Gainers (24h)</span>
          </div>
          <div className="space-y-2">
            {gainers.map(a => (
              <div key={a.id} className="flex items-center justify-between">
                <span className="text-sm font-mono text-foreground">{a.symbol}</span>
                <span className="text-sm font-mono font-bold text-green-400">
                  +{a.price_change_24h?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Top Losers (24h)</span>
          </div>
          <div className="space-y-2">
            {losers.map(a => (
              <div key={a.id} className="flex items-center justify-between">
                <span className="text-sm font-mono text-foreground">{a.symbol}</span>
                <span className="text-sm font-mono font-bold text-red-400">
                  {a.price_change_24h?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['market_cap', 'change_24h', 'volume'].map(s => (
            <Button
              key={s}
              variant={sortBy === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(s)}
              className="text-xs h-9"
            >
              {s === 'market_cap' ? 'Market Cap' : s === 'change_24h' ? '24h Change' : 'Volume'}
            </Button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
              ${category === cat
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground">
          <div className="w-32 flex-shrink-0">Asset</div>
          <div className="w-28 flex-shrink-0">Price</div>
          <div className="hidden sm:flex gap-4 flex-1">
            <div className="w-16 text-center">1H</div>
            <div className="w-16 text-center">24H</div>
            <div className="w-16 text-center">7D</div>
          </div>
          <div className="hidden md:block w-20 flex-shrink-0">Trend</div>
          <div className="hidden lg:block w-28 flex-shrink-0">Signal</div>
          <div className="hidden xl:block w-16 text-right flex-shrink-0">RSI</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No assets found</div>
        ) : (
          <div>
            {filtered.map(asset => (
              <AssetRow key={asset.id} asset={asset} signal={signalMap[asset.symbol]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}