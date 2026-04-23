import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AlertBell() {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadAlerts();
    const unsub = base44.entities.Alert.subscribe((event) => {
      if (event.type === 'create') setAlerts(prev => [event.data, ...prev].slice(0, 20));
    });
    return unsub;
  }, []);

  const loadAlerts = async () => {
    const data = await base44.entities.Alert.list('-created_date', 20);
    setAlerts(data);
  };

  const unread = alerts.filter(a => !a.is_read).length;

  const markRead = async (alert) => {
    if (!alert.is_read) {
      await base44.entities.Alert.update(alert.id, { is_read: true });
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, is_read: true } : a));
    }
  };

  const severityColor = {
    info: 'text-info border-info/20 bg-info/5',
    warning: 'text-warning border-warning/20 bg-warning/5',
    critical: 'text-destructive border-destructive/20 bg-destructive/5',
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 bg-card border-border">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="font-semibold text-sm">Alerts</span>
          {unread > 0 && <Badge variant="destructive" className="text-xs">{unread} new</Badge>}
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {alerts.length === 0 && (
            <p className="p-4 text-center text-muted-foreground text-sm">No alerts</p>
          )}
          {alerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => markRead(alert)}
              className={cn("p-3 cursor-pointer hover:bg-accent/50 transition-colors", !alert.is_read && "bg-primary/5")}
            >
              <div className={cn("flex items-start gap-2 text-xs border rounded-md p-2", severityColor[alert.severity])}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{alert.title}</div>
                  <div className="text-muted-foreground mt-0.5 truncate">{alert.message}</div>
                </div>
                {!alert.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-0.5 flex-shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}