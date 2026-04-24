import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import AssetRow from '@/components/market/AssetRow';
import LiveDataControls from '@/components/market/LiveDataControls';

const CATEGORIES = ['All', 'Layer1', 'Layer2', 'DeFi', 'AI', 'Meme', 'Stablecoin', 'Exchange', 'Other'];

export default function Market() {
  const { t } = useAppPreferences();
  const [assets, setAssets] = useState([]);
  const [signals, setSignals] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('market_cap');
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const loadAssets = async () => {
    const [a, s] = await Promise.all([
      base44.entities.Asset.list('-market_cap', 100),
      base44.entities.AISignal.filter({ status: 'active' }, '-created_date', 100),
    ]);
    setAssets(a);
    setSignals(s);
    // Pick the most recent last_synced from CoinGecko-sourced assets
    const synced = a.filter(x => x.data_source === 'coingecko' && x.last_synced);
    if (synced.length > 0) {
      setLastSyncedAt(synced.sort((a, b) => new Date(b.last_synced) - new Date(a.last_synced))[0].last_synced);
    }
    setLoading(false);
  };

  useEffect(() => { loadAssets(); }, []);

  const signalMap = signals.reduce((m, s) => ({ ...m, [s.asset_symbol]: s }), {});

  const get24h = a => a.change_24h ?? a.price_change_24h ?? 0;

  const filtered = assets
    .filter(a => {
      const matchSearch = a.symbol?.toLowerCase().includes(search.toLowerCase()) ||
        a.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || a.category?.toLowerCase() === category.toLowerCase() || category === 'All';
      return matchSearch && (category === 'All' || matchCat);
    })
    .sort((a, b) => {
      if (sortBy === 'change_24h') return get24h(b) - get24h(a);
      if (sortBy === 'volume') return (b.volume_24h || 0) - (a.volume_24h || 0);
      return (b.market_cap || 0) - (a.market_cap || 0);
    });

  const gainers = [...assets].sort((a, b) => get24h(b) - get24h(a)).slice(0, 3);
  const losers  = [...assets].sort((a, b) => get24h(a) - get24h(b)).slice(0, 3);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-7 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{t('market_title')}</h1>
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">{t('dashboard_active_signals')}</p>
        </div>
        <LiveDataControls
          lastSyncedAt={lastSyncedAt}
          onSynced={() => loadAssets()}
          className="sm:mt-1"
        />
      </div>

      {/* Gainers / Losers */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-green-400 uppercase tracking-wider">Top Gainers</span>
            </div>
          <div className="space-y-2.5">
            {gainers.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-1 min-w-0">
                <span className="text-xs sm:text-sm font-mono text-foreground truncate">{a.symbol}</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-green-400 flex-shrink-0">
                  +{get24h(a)?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-red-400 uppercase tracking-wider">Top Losers</span>
            </div>
          <div className="space-y-2.5">
            {losers.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-1 min-w-0">
                <span className="text-xs sm:text-sm font-mono text-foreground truncate">{a.symbol}</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-red-400 flex-shrink-0">
                  {get24h(a)?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mt-7">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
             placeholder={t('market_search')}
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="pl-9 bg-card border-border"
           />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {['market_cap', 'change_24h', 'volume'].map(sortVal => (
            <Button
              key={sortVal}
              variant={sortBy === sortVal ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(sortVal)}
              className="text-xs h-9 whitespace-nowrap flex-shrink-0"
            >
              {sortVal === 'market_cap' ? 'Market Cap' : sortVal === 'change_24h' ? t('market_sort_change_24h') : t('market_sort_volume')}
            </Button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
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

      {/* Asset list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header — desktop only */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-3.5 border-b border-border bg-muted/30 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
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
           <div className="text-center py-16 text-muted-foreground">{t('market_no_results')}</div>
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