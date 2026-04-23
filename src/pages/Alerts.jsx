import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const severityConfig = {
  info: { icon: Info, cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  warning: { icon: AlertTriangle, cls: 'text-warning bg-warning/10 border-warning/20' },
  critical: { icon: Zap, cls: 'text-destructive bg-destructive/10 border-destructive/20' },
};

const typeLabels = {
  signal: 'Signal', risk: 'Risk', tp_hit: 'TP Hit', sl_hit: 'SL Hit',
  price: 'Price', volatility: 'Volatility', system: 'System', emergency: '🚨 Emergency',
};

export default function Alerts() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts-all'],
    queryFn: () => base44.entities.Alert.list('-created_date', 100),
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Alert.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts-all'] }),
  });

  const deleteAlert = useMutation({
    mutationFn: (id) => base44.entities.Alert.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts-all'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = alerts.filter((a) => !a.is_read);
      await Promise.all(unread.map((a) => base44.entities.Alert.update(a.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts-all'] }),
  });

  const filtered = alerts.filter((a) => {
    if (filter === 'unread') return !a.is_read;
    if (filter === 'critical') return a.severity === 'critical';
    if (filter !== 'all') return a.type === filter;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{unreadCount} unread alerts</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllRead.mutate()} className="gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'unread', 'critical', 'signal', 'risk', 'tp_hit', 'sl_hit', 'price', 'volatility', 'system'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1 rounded-full text-xs font-medium capitalize transition-all',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
            {f === 'all' ? 'All' : f === 'unread' ? `Unread (${unreadCount})` : typeLabels[f] || f}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading alerts...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No alerts found.</p>
            <p className="text-xs text-muted-foreground mt-1">Alert Agent will notify you about signals, risk events, and price movements.</p>
          </div>
        ) : (
          filtered.map((a) => {
            const sev = severityConfig[a.severity] || severityConfig.info;
            const SevIcon = sev.icon;
            return (
              <div key={a.id} className={cn(
                'bg-card border rounded-xl p-4 transition-all',
                a.is_read ? 'border-border opacity-60' : `border-border`,
                !a.is_read && a.severity === 'critical' ? 'border-destructive/30' : ''
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border', sev.cls)}>
                    <SevIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{a.title}</p>
                          {!a.is_read && <span className="w-2 h-2 bg-primary rounded-full" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{typeLabels[a.type] || a.type}</span>
                          {a.asset_symbol && <span className="text-xs font-mono text-foreground">{a.asset_symbol}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!a.is_read && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markRead.mutate(a.id)}>
                            <CheckCheck className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteAlert.mutate(a.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}