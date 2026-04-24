import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const severityConfig = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  critical: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' },
};

export default function RecentAlerts() {
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts-recent'],
    queryFn: () => base44.entities.Alert.list('-created_date', 5),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Alerts
        </h3>
        <Link to="/alerts" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No alerts. The system will notify you of important events.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const config = severityConfig[alert.severity] || severityConfig.info;
            const IconComp = config.icon;
            return (
              <div key={alert.id} className={cn("flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-current/20 transition-colors", config.bg)}>
                <IconComp className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}