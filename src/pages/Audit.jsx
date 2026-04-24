import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
};

const severityColors = {
  info: 'text-blue-400',
  warning: 'text-yellow-400',
  critical: 'text-red-400',
};

export default function Audit() {
  const { t } = useAppPreferences();
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> {t('audit_log')}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 sm:mt-1">{t('audit_title')}</p>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No audit logs recorded yet</div>
        ) : logs.map(log => {
          const IconComp = severityIcons[log.severity] || Info;
          return (
            <div key={log.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] capitalize">{log.action?.replace(/_/g, ' ')}</Badge>
                  {log.asset_symbol && <span className="text-[10px] font-mono font-bold text-primary">{log.asset_symbol}</span>}
                </div>
                <IconComp className={cn("w-4 h-4 flex-shrink-0 mt-0.5", severityColors[log.severity])} />
              </div>
              <p className="text-sm text-foreground leading-relaxed">{log.details}</p>
              <p className="text-xs font-mono text-muted-foreground">
                {log.created_date && format(new Date(log.created_date), 'MMM d, HH:mm:ss')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Details</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Asset</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Severity</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-12 text-muted-foreground">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-muted-foreground">No audit logs recorded yet</td></tr>
              ) : (
                logs.map(log => {
                  const IconComp = severityIcons[log.severity] || Info;
                  return (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                        {log.created_date && format(new Date(log.created_date), 'MMM d, HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] capitalize">{log.action?.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground max-w-md truncate">{log.details}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{log.asset_symbol || '—'}</td>
                      <td className="text-center px-4 py-3">
                        <IconComp className={cn("w-4 h-4 inline", severityColors[log.severity])} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}