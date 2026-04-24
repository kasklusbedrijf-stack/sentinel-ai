import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PriceChange from '@/components/dashboard/PriceChange';
import { cn } from '@/lib/utils';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import KrakenSyncControls from '@/components/market/KrakenSyncControls';
import PortfolioPnlChart from '@/components/portfolio/PortfolioPnlChart';

export default function Portfolio() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ asset_symbol: '', asset_name: '', quantity: '', avg_buy_price: '', category: '' });
  const queryClient = useQueryClient();
  const { formatCurrency, t } = useAppPreferences();

  const [krakenLastSync, setKrakenLastSync] = useState(null);

  const { data: assets = [], isLoading, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const data = await base44.entities.PortfolioAsset.list('-current_value', 100);
      const synced = data.find(x => x.data_source === 'kraken' && x.last_synced);
      if (synced) setKrakenLastSync(synced.last_synced);
      return data;
    },
  });

  const addAsset = useMutation({
    mutationFn: (data) => base44.entities.PortfolioAsset.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['portfolio'] }); setShowAdd(false); setForm({ asset_symbol: '', asset_name: '', quantity: '', avg_buy_price: '', category: '' }); },
  });

  const deleteAsset = useMutation({
    mutationFn: (id) => base44.entities.PortfolioAsset.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  const totalValue = assets.reduce((s, a) => s + (a.current_value || 0), 0);
  const totalPnl = assets.reduce((s, a) => s + (a.unrealized_pnl || 0), 0);
  const totalRealized = assets.reduce((s, a) => s + (a.realized_pnl || 0), 0);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('portfolio_holdings')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t('portfolio_total_value')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <KrakenSyncControls
            lastSyncedAt={krakenLastSync}
            onSynced={(d) => { setKrakenLastSync(d.synced_at); refetch(); }}
          />
          <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('portfolio_add_holding')}</span><span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('portfolio_total_value'), value: formatCurrency(totalValue), icon: DollarSign },
          { label: t('portfolio_unrealized_pnl'), value: `${totalPnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(totalPnl))}`, icon: TrendingUp, positive: totalPnl >= 0 },
          { label: t('portfolio_realized_pnl'), value: `${totalRealized >= 0 ? '+' : ''}${formatCurrency(Math.abs(totalRealized))}`, icon: TrendingUp, positive: totalRealized >= 0 },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 sm:p-5">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={cn('text-base sm:text-2xl font-bold mt-1 font-mono truncate', s.positive !== undefined ? (s.positive ? 'text-green-400' : 'text-destructive') : 'text-foreground')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* PnL Chart */}
      {assets.length > 0 && <PortfolioPnlChart assets={assets} />}

      {/* Add Form */}
      {showAdd && (
        <div className="bg-card border border-primary/30 rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-foreground mb-3 sm:mb-4">{t('portfolio_add_holding')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'asset_symbol', placeholder: 'BTC', label: 'Symbol' },
              { key: 'asset_name', placeholder: 'Bitcoin', label: 'Name' },
              { key: 'quantity', placeholder: '0.5', label: 'Quantity', type: 'number' },
              { key: 'avg_buy_price', placeholder: '45000', label: 'Avg Buy ($)', type: 'number' },
              { key: 'current_price', placeholder: '46000', label: 'Current Price ($)', type: 'number' },
              { key: 'category', placeholder: 'e.g. layer1', label: 'Category' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={form[field.key] || ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button onClick={() => addAsset.mutate({
              ...form,
              quantity: parseFloat(form.quantity),
              avg_buy_price: parseFloat(form.avg_buy_price),
              current_price: parseFloat(form.current_price || 0),
              current_value: parseFloat(form.quantity) * parseFloat(form.current_price || form.avg_buy_price || 0),
              unrealized_pnl: (parseFloat(form.current_price || form.avg_buy_price) - parseFloat(form.avg_buy_price)) * parseFloat(form.quantity),
            })} disabled={!form.asset_symbol || !form.quantity} className="sm:w-auto w-full">
              {t('portfolio_add_holding')}
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)} className="sm:w-auto w-full">{t('global_cancel')}</Button>
          </div>
        </div>
      )}

      {/* Mobile cards / Desktop table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : assets.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
          {t('portfolio_add_holding')}
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {assets.map((a) => (
              <div key={a.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-primary">
                      {a.asset_symbol?.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{a.asset_symbol}</p>
                      <p className="text-xs text-muted-foreground">{a.asset_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-foreground">{formatCurrency(a.current_value)}</p>
                    <p className="text-xs text-muted-foreground">{a.allocation_pct?.toFixed(1)}% alloc.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-secondary/50 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground mb-0.5">Qty</p>
                    <p className="font-mono font-semibold text-foreground">{a.quantity}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2 text-center">
                   <p className="text-muted-foreground mb-0.5">Avg Buy</p>
                   <p className="font-mono font-semibold text-foreground">{formatCurrency(a.avg_buy_price)}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2 text-center">
                   <p className="text-muted-foreground mb-0.5">Current</p>
                   <p className="font-mono font-semibold text-foreground">{formatCurrency(a.current_price)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Unrealized PnL</p>
                      <div className="flex items-center gap-1">
                        <PriceChange value={a.unrealized_pnl_pct} showIcon={false} />
                        <span className="text-xs text-muted-foreground">({formatCurrency(a.unrealized_pnl)})</span>
                      </div>
                    </div>
                    {a.realized_pnl !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground">Realized</p>
                        <span className={cn('text-xs font-medium font-mono', a.realized_pnl >= 0 ? 'text-green-400' : 'text-destructive')}>
                          {a.realized_pnl >= 0 ? '+' : ''}${a.realized_pnl?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteAsset.mutate(a.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    {['Asset', 'Quantity', 'Avg Buy', 'Current Price', 'Value', 'Allocation', 'Unrealized PnL', 'Realized PnL', ''].map((h) => (
                      <th key={h} className={cn('px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider', h === 'Asset' ? 'text-left' : 'text-right')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{a.asset_symbol}</p>
                        <p className="text-xs text-muted-foreground">{a.asset_name}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{a.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(a.avg_buy_price)}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(a.current_price)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{formatCurrency(a.current_value)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{a.allocation_pct?.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right">
                        <PriceChange value={a.unrealized_pnl_pct} showIcon={false} />
                        <p className="text-xs text-muted-foreground">{formatCurrency(a.unrealized_pnl)}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.realized_pnl !== undefined ? (
                          <span className={cn('text-sm font-medium', a.realized_pnl >= 0 ? 'text-green-400' : 'text-destructive')}>
                            {a.realized_pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(a.realized_pnl)).slice(1)}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteAsset.mutate(a.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}