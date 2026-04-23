import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Shield, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PriceChange from '@/components/dashboard/PriceChange';
import { cn } from '@/lib/utils';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { useAppPreferences as useT } from '@/lib/AppPreferencesContext';

export default function Positions() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ asset_symbol: '', side: 'long', entry_price: '', quantity: '', stop_loss: '', tp1: '', tp2: '', tp3: '', risk_pct: '' });
  const queryClient = useQueryClient();
  const { formatCurrency, t } = useAppPreferences();

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: () => base44.entities.Position.list('-created_date', 50),
  });

  const addPosition = useMutation({
    mutationFn: (data) => base44.entities.Position.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['positions'] }); setShowAdd(false); },
  });

  const updatePosition = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Position.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  });

  const open = positions.filter((p) => p.status === 'open');
  const closed = positions.filter((p) => p.status !== 'open');

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('positions_open')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t('dashboard_open_positions')}</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gap-1.5 flex-shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('positions_add_position')}</span><span className="sm:hidden">{t('global_save')}</span>
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border border-primary/30 rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-foreground mb-4">{t('positions_add_position')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { key: 'asset_symbol', label: 'Symbol', placeholder: 'BTC', col: 'col-span-2 sm:col-span-1' },
              { key: 'entry_price', label: 'Entry Price', placeholder: '45000', type: 'number' },
              { key: 'current_price', label: 'Current Price', placeholder: '46000', type: 'number' },
              { key: 'quantity', label: 'Quantity', placeholder: '0.1', type: 'number' },
              { key: 'stop_loss', label: 'Stop Loss', placeholder: '44000', type: 'number' },
              { key: 'tp1', label: 'TP1', placeholder: '48000', type: 'number' },
              { key: 'tp2', label: 'TP2', placeholder: '52000', type: 'number' },
              { key: 'risk_pct', label: 'Risk %', placeholder: '2', type: 'number' },
            ].map((f) => (
              <div key={f.key} className={f.col || ''}>
                <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                <input type={f.type || 'text'} placeholder={f.placeholder}
                  value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            ))}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Side</label>
              <select value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })}
                className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button onClick={() => addPosition.mutate({
              ...form,
              entry_price: parseFloat(form.entry_price),
              current_price: parseFloat(form.current_price || form.entry_price),
              quantity: parseFloat(form.quantity),
              stop_loss: parseFloat(form.stop_loss),
              tp1: parseFloat(form.tp1),
              tp2: parseFloat(form.tp2),
              risk_pct: parseFloat(form.risk_pct),
              position_value: parseFloat(form.quantity) * parseFloat(form.current_price || form.entry_price),
              status: 'open',
            })} disabled={!form.asset_symbol || !form.entry_price || !form.quantity} className="sm:w-auto w-full">
              {t('positions_add_position')}
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)} className="sm:w-auto w-full">{t('global_cancel')}</Button>
          </div>
        </div>
      )}

      {/* Open positions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('positions_open')} ({open.length})</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">{t('global_save')}...</div>
        ) : open.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            {t('dashboard_open_positions')}
          </div>
        ) : (
          open.map((p) => {
            const pnl = p.current_price && p.entry_price ? ((p.current_price - p.entry_price) / p.entry_price * 100) : 0;
            return (
              <div key={p.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold',
                      p.side === 'long' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                      {p.side?.toUpperCase().charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{p.asset_symbol}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.side} · {p.quantity} units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <PriceChange value={pnl} />
                     <span className="text-sm font-mono text-foreground">{formatCurrency(p.position_value)}</span>
                    <button onClick={() => updatePosition.mutate({ id: p.id, data: { status: 'closed' } })}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price row */}
                 <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                   <div className="text-center p-2 bg-secondary/50 rounded-lg">
                     <p className="text-xs text-muted-foreground">Entry</p>
                     <p className="font-mono font-semibold text-foreground">{formatCurrency(p.entry_price)}</p>
                   </div>
                   <div className="text-center p-2 bg-secondary/50 rounded-lg">
                     <p className="text-xs text-muted-foreground">Current</p>
                     <p className="font-mono font-semibold text-foreground">{formatCurrency(p.current_price)}</p>
                   </div>
                   <div className="text-center p-2 bg-secondary/50 rounded-lg">
                     <p className="text-xs text-muted-foreground">Risk %</p>
                     <p className={cn('font-mono font-semibold', (p.risk_pct || 0) > 3 ? 'text-destructive' : 'text-warning')}>{p.risk_pct?.toFixed(1)}%</p>
                   </div>
                 </div>

                {/* SL / TP row */}
                 <div className="flex items-center gap-3 flex-wrap">
                   {p.stop_loss && (
                     <div className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg">
                       <Shield className="w-3 h-3" /> SL: {formatCurrency(p.stop_loss)}
                     </div>
                   )}
                   {[p.tp1, p.tp2, p.tp3].filter(Boolean).map((tp, i) => (
                     <div key={i} className="flex items-center gap-1.5 text-xs bg-success/10 text-success px-3 py-1.5 rounded-lg">
                       <Target className="w-3 h-3" /> TP{i + 1}: {formatCurrency(tp)}
                     </div>
                   ))}
                  {p.trailing_stop_active && (
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">Trailing Stop</span>
                  )}
                  {p.break_even_active && (
                    <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">Break Even</span>
                  )}
                </div>

                {p.notes && <p className="text-xs text-muted-foreground mt-3 italic">{p.notes}</p>}
              </div>
            );
          })
        )}
      </div>

      {/* Closed */}
      {closed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('positions_closed')} ({closed.length})</h2>
          {closed.map((p) => (
            <div key={p.id} className="bg-card border border-border/50 rounded-xl p-4 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-foreground">{p.asset_symbol}</p>
                  <span className="text-xs text-muted-foreground capitalize">{p.side}</span>
                </div>
                <PriceChange value={p.pnl_pct} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}