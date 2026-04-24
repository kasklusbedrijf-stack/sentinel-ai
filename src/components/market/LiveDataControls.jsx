import { useState } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function formatRelativeTime(iso) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

export default function LiveDataControls({ onSynced, lastSyncedAt, className }) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState(null); // null | 'ok' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setStatus(null);
    setErrorMsg('');
    try {
      const res = await base44.functions.invoke('syncCoinGeckoMarket', {});
      if (res.data?.success) {
        setStatus('ok');
        if (onSynced) onSynced(res.data);
      } else if (res.data?.rate_limited) {
        setStatus('error');
        setErrorMsg('Rate limited — wait 60s');
      } else {
        setStatus('error');
        setErrorMsg(res.data?.error || 'Sync failed');
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
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-500/20 bg-blue-500/5">
        <div className={cn('w-1.5 h-1.5 rounded-full', status === 'ok' ? 'bg-green-400' : status === 'error' ? 'bg-red-400' : 'bg-blue-400')} />
        <span className="text-xs font-medium text-blue-400">CoinGecko</span>
      </div>

      {/* Last updated */}
      {lastSyncedAt && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatRelativeTime(lastSyncedAt)}</span>
        </div>
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
        {syncing ? 'Syncing…' : 'Sync Live'}
      </Button>

      {/* Error */}
      {status === 'error' && (
        <span className="text-xs text-destructive truncate max-w-48">{errorMsg}</span>
      )}
    </div>
  );
}