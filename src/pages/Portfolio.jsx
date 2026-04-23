import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PriceChange from '@/components/dashboard/PriceChange';
import { cn } from '@/lib/utils';

export default function Portfolio() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ asset_symbol: '', asset_name: '', quantity: '', avg_buy_price: '', category: '' });
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.PortfolioAsset.list('-current_value', 100),
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your holdings and performance</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gap-1.5 flex-shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Holding</span><span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign },
          { label: 'Unrealized PnL', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, icon: TrendingUp, positive: totalPnl >= 0 },
          { label: 'Realized PnL', value: `${totalRealized >= 0 ? '+' : ''}$${totalRealized.toFixed(2)}`, icon: TrendingUp, positive: totalRealized >= 0 },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 sm:p-5">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={cn('text-base sm:text-2xl font-bold mt-1 font-mono truncate', s.positive !== undefined ? (s.positive ? 'text-green-400' : 'text-destructive') : 'text-foreground')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-card border border-primary/30 rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Add Holding</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'asset_symbol', placeholder: 'Symbol (e.g. BTC)', label: 'Symbol' },
              { key: 'asset_name', placeholder: 'Name (e.g. Bitcoin)', label: 'Name' },
              { key: 'quantity', placeholder: 'Quantity', label: 'Quantity', type: 'number' },
              { key: 'avg_buy_price', placeholder: 'Avg buy price ($)', label: 'Avg Buy Price', type: 'number' },
              { key: 'current_price', placeholder: 'Current price ($)', label: 'Current Price', type: 'number' },
              { key: 'category', placeholder: 'Category', label: 'Category' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={form[field.key] || ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => addAsset.mutate({
              ...form,
              quantity: parseFloat(form.quantity),
              avg_buy_price: parseFloat(form.avg_buy_price),
              current_price: parseFloat(form.current_price || 0),
              current_value: parseFloat(form.quantity) * parseFloat(form.current_price || form.avg_buy_price || 0),
              unrealized_pnl: (parseFloat(form.current_price || form.avg_buy_price) - parseFloat(form.avg_buy_price)) * parseFloat(form.quantity),
            })} disabled={!form.asset_symbol || !form.quantity}>
              Add Holding
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Mobile cards / Desktop table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading portfolio...</div>
      ) : assets.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
          No holdings yet. Add your first asset above.
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
                    <p className="font-mono font-semibold text-foreground">${a.current_value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
                    <p className="font-mono font-semibold text-foreground">${a.avg_buy_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground mb-0.5">Current</p>
                    <p className="font-mono font-semibold text-foreground">${a.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Unrealized PnL</p>
                      <div className="flex items-center gap-1">
                        <PriceChange value={a.unrealized_pnl_pct} showIcon={false} />
                        <span className="text-xs text-muted-foreground">(${a.unrealized_pnl?.toFixed(2)})</span>
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
                      <td className="px-4 py-3 text-right font-mono text-foreground">${a.avg_buy_price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">${a.current_price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">${a.current_value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{a.allocation_pct?.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right">
                        <PriceChange value={a.unrealized_pnl_pct} showIcon={false} />
                        <p className="text-xs text-muted-foreground">${a.unrealized_pnl?.toFixed(2)}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.realized_pnl !== undefined ? (
                          <span className={cn('text-sm font-medium', a.realized_pnl >= 0 ? 'text-green-400' : 'text-destructive')}>
                            {a.realized_pnl >= 0 ? '+' : ''}${a.realized_pnl?.toFixed(2)}
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