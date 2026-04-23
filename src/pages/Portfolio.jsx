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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your holdings and performance</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Holding
        </Button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign },
          { label: 'Unrealized PnL', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, icon: TrendingUp, positive: totalPnl >= 0 },
          { label: 'Realized PnL', value: `${totalRealized >= 0 ? '+' : ''}$${totalRealized.toFixed(2)}`, icon: TrendingUp, positive: totalRealized >= 0 },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.positive !== undefined ? (s.positive ? 'text-success' : 'text-destructive') : 'text-foreground')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-card border border-primary/30 rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Add Holding</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
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
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">Loading portfolio...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No holdings yet. Add your first asset above.</td></tr>
              ) : (
                assets.map((a) => (
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
                        <span className={cn('text-sm font-medium', a.realized_pnl >= 0 ? 'text-success' : 'text-destructive')}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}