import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Check, CheckCheck, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { cn } from '@/lib/utils';

const severityConfig = {
  info: { color: 'border-info/30 bg-info/5', dot: 'bg-info', badge: 'text-info bg-info/10 border-info/20' },
  warning: { color: 'border-warning/30 bg-warning/5', dot: 'bg-warning', badge: 'text-warning bg-warning/10 border-warning/20' },
  critical: { color: 'border-destructive/30 bg-destructive/5', dot: 'bg-destructive', badge: 'text-destructive bg-destructive/10 border-destructive/20' },
};

const typeIcons = { signal: '⚡', risk: '🛡️', tp_hit: '🎯', sl_hit: '🔴', price: '💰', volatility: '📊', system: '⚙️', emergency: '🚨' };

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { t } = useAppPreferences();

  useEffect(() => {
    base44.entities.Alert.list('-created_date', 100).then(d => { setAlerts(d); setLoading(false); });
    const unsub = base44.entities.Alert.subscribe(event => {
      if (event.type === 'create') setAlerts(prev => [event.data, ...prev]);
      if (event.type === 'update') setAlerts(prev => prev.map(a => a.id === event.id ? event.data : a));
    });
    return unsub;
  }, []);

  const markRead = async (id) => {
    await base44.entities.Alert.update(id, { is_read: true });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.is_read);
    await Promise.all(unread.map(a => base44.entities.Alert.update(a.id, { is_read: true })));
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  const filtered = alerts.filter(a => filter === 'all' || (filter === 'unread' ? !a.is_read : a.type === filter));
  const unreadCount = alerts.filter(a => !a.is_read).length;

  const types = ['all', 'unread', 'signal', 'risk', 'tp_hit', 'sl_hit', 'price', 'volatility', 'emergency'];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> {t('alerts_title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{unreadCount} {t('alerts_unread')}</p>
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead} className="gap-2 flex-shrink-0">
          <CheckCheck className="w-4 h-4" /> <span className="hidden sm:inline">{t('alerts_mark_read')}</span><span className="sm:hidden">{t('alerts_mark_as_read')}</span>
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {types.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
              filter === type ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40')}
          >
            {type === 'all' ? t('signals_filter_all') : type === 'unread' ? `${t('alerts_unread')} (${unreadCount})` : t(`alerts_type_${type}`) || type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t('alerts_no_alerts')}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map(alert => {
          const sev = severityConfig[alert.severity] || severityConfig.info;
          return (
            <div
              key={alert.id}
              className={cn("flex items-start gap-3 sm:gap-4 p-4 sm:p-4 rounded-xl border transition-all", sev.color, !alert.is_read && "ring-1 ring-primary/20")}
            >
              {/* Left icon */}
              <div className="text-xl sm:text-2xl flex-shrink-0 mt-0.5 leading-none">{typeIcons[alert.type] || '🔔'}</div>

              {/* Body */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <span className="font-semibold text-sm leading-snug block">{alert.title}</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", sev.badge)}>{alert.severity}</span>
                  <span className="text-[10px] font-mono text-muted-foreground border border-border px-2 py-0.5 rounded-full">{alert.type}</span>
                  {alert.asset_symbol && <span className="text-[10px] font-mono font-bold text-primary">{alert.asset_symbol}</span>}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{alert.message}</p>
                <div className="text-xs text-muted-foreground">
                  {new Date(alert.created_date).toLocaleString()}
                </div>
              </div>

              {/* Right check — always outside the body column */}
              {!alert.is_read && (
                <button onClick={() => markRead(alert.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}