import { useState } from 'react';
import { RefreshCw, Lock, Clock, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function formatRelativeTime(iso) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

export default function KrakenSyncControls({ onSynced, lastSyncedAt, className }) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState(null); // null | 'ok' | 'not_configured' | 'error'
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setStatus(null);
    setErrorMsg('');
    try {
      const res = await base44.functions.invoke('syncKrakenAccount', {});
      const data = res.data;

      if (data?.kraken_configured === false) {
        setStatus('not_configured');
      } else if (data?.success) {
        setStatus('ok');
        setResult(data);
        if (onSynced) onSynced(data);
      } else {
        setStatus('error');
        setErrorMsg(data?.error || 'Sync failed');
      }
    } catch (e) {
      setStatus('error');
      setErrorMsg(e.message);
    }
    setSyncing(false);
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Data source badge */}
      <div className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border',
        status === 'ok' ? 'border-green-500/20 bg-green-500/5' :
        status === 'not_configured' ? 'border-yellow-500/20 bg-yellow-500/5' :
        'border-orange-500/20 bg-orange-500/5'
      )}>
        <Lock className={cn('w-3 h-3', status === 'ok' ? 'text-green-400' : status === 'not_configured' ? 'text-yellow-400' : 'text-orange-400')} />
        <span className={cn('text-xs font-medium', status === 'ok' ? 'text-green-400' : status === 'not_configured' ? 'text-yellow-400' : 'text-orange-400')}>
          Kraken {status === 'ok' ? '· Connected' : status === 'not_configured' ? '· Not configured' : '· Account'}
        </span>
      </div>

      {/* Last updated */}
      {lastSyncedAt && status === 'ok' && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatRelativeTime(lastSyncedAt)}</span>
        </div>
      )}

      {/* Result summary */}
      {status === 'ok' && result && (
        <span className="text-xs text-muted-foreground">
          {result.balance_count} assets · {result.open_order_count} orders
        </span>
      )}

      {/* Sync button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleSync}
        disabled={syncing}
        className="h-7 text-xs px-2.5 gap-1.5"
      >
        <RefreshCw className={cn('w-3 h-3', syncing && 'animate-spin')} />
        {syncing ? 'Syncing…' : 'Sync Account'}
      </Button>

      {/* Not configured hint */}
      {status === 'not_configured' && (
        <div className="flex items-center gap-1 text-xs text-yellow-400">
          <AlertCircle className="w-3 h-3" />
          <span>Add keys in Settings</span>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <span className="text-xs text-destructive truncate max-w-48">{errorMsg}</span>
      )}
    </div>
  );
}