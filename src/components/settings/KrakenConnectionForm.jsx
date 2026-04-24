import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, RefreshCw, ChevronDown, ChevronUp, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
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

export default function KrakenConnectionForm({ onConnectionStatusChange }) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unchecked'); // unchecked | testing | connected | failed | not_configured
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Check if Kraken is already configured on mount
  useEffect(() => {
    checkKrakenStatus();
  }, []);

  const checkKrakenStatus = async () => {
    try {
      const res = await base44.functions.invoke('syncKrakenAccount', {});
      if (res.data?.kraken_configured === false) {
        setConnectionStatus('not_configured');
      } else if (res.data?.success) {
        setConnectionStatus('connected');
        setTestResult({ balance_count: res.data.balance_count, open_order_count: res.data.open_order_count });
        setLastSyncTime(new Date().toISOString());
        setShowEditForm(false);
      } else {
        setConnectionStatus('failed');
        setTestResult({ error: res.data?.error || 'Unable to verify connection' });
      }
    } catch (e) {
      setConnectionStatus('failed');
      setTestResult({ error: e.message });
    }
  };

  const handleSyncAccount = async () => {
    setSyncing(true);
    setStatusMessage('Syncing account data…');
    try {
      const res = await base44.functions.invoke('syncKrakenAccount', {});
      if (res.data?.success) {
        setTestResult({ balance_count: res.data.balance_count, open_order_count: res.data.open_order_count });
        setLastSyncTime(new Date().toISOString());
        setStatusMessage('✓ Account synced');
        toast.success('Account synced successfully');
      } else {
        setStatusMessage(`✗ Sync failed: ${res.data?.error || 'Unknown error'}`);
        toast.error('Sync failed');
      }
    } catch (e) {
      setStatusMessage(`✗ Error: ${e.message}`);
      toast.error('Sync error: ' + e.message);
    }
    setSyncing(false);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error('Please enter both API key and secret');
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const res = await base44.functions.invoke('syncKrakenAccount', {
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
      });
      if (res.data?.success) {
        setConnectionStatus('connected');
        setTestResult({
          balance_count: res.data.balance_count,
          open_order_count: res.data.open_order_count,
          success: true,
        });
        toast.success('Kraken connection verified!');
      } else if (res.data?.kraken_configured === false) {
        setConnectionStatus('not_configured');
        setTestResult({ error: 'API keys not found in environment. Contact support to add them.' });
        toast.error('Not configured');
      } else {
        setConnectionStatus('failed');
        setTestResult({ error: res.data?.error || 'Connection test failed' });
        toast.error(res.data?.error || 'Connection test failed');
      }
    } catch (e) {
      setConnectionStatus('failed');
      setTestResult({ error: e.message });
      toast.error('Connection test error: ' + e.message);
    }
    setTesting(false);
  };

  const handleSaveKeys = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setStatusMessage('Please enter both API key and secret');
      toast.error('Please enter both API key and secret');
      return;
    }

    setSaving(true);
    setStatusMessage('Saving and testing credentials…');
    toast.info('Testing Kraken connection…');
    try {
      setFormDirty(false);
      setTesting(true);
      setTestResult(null);
      const res = await base44.functions.invoke('syncKrakenAccount', {
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
      });
      if (res.data?.success) {
        setConnectionStatus('connected');
        setTestResult({
          balance_count: res.data.balance_count,
          open_order_count: res.data.open_order_count,
          success: true,
        });
        setLastSyncTime(new Date().toISOString());
        setStatusMessage('✓ Connected successfully!');
        setShowEditForm(false);
        toast.success('Kraken connection verified!');
        setTimeout(() => setStatusMessage(''), 3000);
      } else if (res.data?.kraken_configured === false) {
        setConnectionStatus('not_configured');
        setTestResult({ error: 'API keys not found in environment. Contact support to add them.' });
        setStatusMessage('✗ API keys not found in environment');
        toast.error('Not configured');
      } else {
        setConnectionStatus('failed');
        setTestResult({ error: res.data?.error || 'Connection test failed' });
        setStatusMessage(`✗ ${res.data?.error || 'Connection test failed'}`);
        toast.error(res.data?.error || 'Connection test failed');
      }
      setTesting(false);
    } catch (e) {
      setConnectionStatus('failed');
      setTestResult({ error: e.message });
      setStatusMessage(`✗ Error: ${e.message}`);
      toast.error('Failed to save keys: ' + e.message);
      setTesting(false);
    }
    setSaving(false);
  };

  const handleClear = () => {
    setApiKey('');
    setApiSecret('');
    setConnectionStatus('unchecked');
    setTestResult(null);
    setFormDirty(false);
    setShowEditForm(false);
    setLastSyncTime(null);
    setStatusMessage('');
    toast.success('Kraken keys removed');
  };

  const handleDisconnect = async () => {
    if (window.confirm("Remove Kraken connection? You'll need to add keys again.")) {
      handleClear();
    }
  };

  const handleRetestConnection = async () => {
    setTesting(true);
    setStatusMessage('Re-testing connection…');
    try {
      const res = await base44.functions.invoke('syncKrakenAccount', {});
      if (res.data?.success) {
        setConnectionStatus('connected');
        setTestResult({ balance_count: res.data.balance_count, open_order_count: res.data.open_order_count });
        setLastSyncTime(new Date().toISOString());
        setStatusMessage('✓ Connection verified');
        toast.success('Connection verified!');
      } else {
        setConnectionStatus('failed');
        setTestResult({ error: res.data?.error || 'Connection test failed' });
        setStatusMessage(`✗ ${res.data?.error || 'Connection test failed'}`);
        toast.error('Connection test failed');
      }
    } catch (e) {
      setConnectionStatus('failed');
      setTestResult({ error: e.message });
      setStatusMessage(`✗ Error: ${e.message}`);
      toast.error('Connection test error');
    }
    setTesting(false);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Show connected-state card as primary view when connected
  if (connectionStatus === 'connected' && !showEditForm) {
    return (
      <div className="space-y-4">
        {/* Connected State Card */}
        <div className="p-4 sm:p-5 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0 mt-1.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-400">Connected to Kraken</p>
              <p className="text-xs text-muted-foreground mt-0.5">REST API & WebSocket</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-green-500/10">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Assets Connected</p>
              <p className="text-lg font-bold text-green-400">{testResult?.balance_count || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Open Orders</p>
              <p className="text-lg font-bold text-green-400">{testResult?.open_order_count || 0}</p>
            </div>
          </div>

          {/* Last sync */}
          {lastSyncTime && (
            <p className="text-xs text-muted-foreground text-center mb-4">
              Last synced: {formatRelativeTime(lastSyncTime)}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncAccount}
              disabled={syncing}
              className="flex-1 text-xs gap-1.5 h-8"
            >
              {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {syncing ? 'Syncing…' : 'Sync Account'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetestConnection}
              disabled={testing}
              className="flex-1 text-xs gap-1.5 h-8"
            >
              {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCw className="w-3 h-3" />}
              {testing ? 'Testing…' : 'Re-test'}
            </Button>
          </div>

          {/* Secondary actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEditForm(true)}
              className="flex-1 text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              Replace Keys
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDisconnect}
              className="flex-1 text-xs h-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Status message (from sync/retest) */}
        {statusMessage && (
          <div className={cn(
            'p-3 rounded-lg text-xs font-medium transition-all',
            statusMessage.startsWith('✓')
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
          )}>
            {statusMessage}
          </div>
        )}

        {/* Security note */}
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-muted-foreground">
          <p className="font-medium text-blue-400 mb-1">✓ Secure Connection</p>
          <p>Keys are stored in environment variables. Never exposed in UI.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status indicator for non-connected states */}
      {connectionStatus === 'connected' && showEditForm && (
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-400">Kraken Account Connected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {testResult?.balance_count || 0} assets · {testResult?.open_order_count || 0} open orders
            </p>
          </div>
        </div>
      )}

      {/* Header with back button when editing */}
      {connectionStatus === 'connected' && showEditForm && (
        <button
          onClick={() => setShowEditForm(false)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronUp className="w-3 h-3" />
          Back to connected view
        </button>
      )}

      {connectionStatus === 'not_configured' && (
        <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-400">Not Configured</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add your Kraken API keys below to connect your account.</p>
          </div>
        </div>
      )}

      {connectionStatus === 'failed' && testResult?.error && (
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 flex items-start gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Connection Failed</p>
            <p className="text-xs text-muted-foreground mt-0.5">{testResult.error}</p>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
        <p className="text-xs text-muted-foreground mb-2">
          <strong>How it works:</strong> You'll add your Kraken API keys to the app's environment variables. This allows the app to:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 ml-3">
          <li>• Read your account balances and holdings</li>
          <li>• Monitor open orders and fills</li>
          <li>• Place trades (with your approval)</li>
          <li>• Stream live prices via WebSocket</li>
        </ul>
      </div>

      {/* Form title */}
      {showEditForm && connectionStatus === 'connected' && (
        <h4 className="text-sm font-semibold text-foreground mb-4">Update Kraken API Keys</h4>
      )}
      {connectionStatus !== 'connected' && (
        <h4 className="text-sm font-semibold text-foreground mb-4">Add Kraken API Keys</h4>
      )}

      {/* API Key inputs */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="kraken-api-key" className="text-xs text-muted-foreground">
            Kraken API Key
          </Label>
          <Input
            id="kraken-api-key"
            type="text"
            placeholder="Enter your Kraken API key"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setFormDirty(true);
            }}
            className="bg-card border-border text-sm"
            disabled={connectionStatus === 'connected'}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Generate at: kraken.com → Settings → API
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kraken-api-secret" className="text-xs text-muted-foreground">
            Kraken Private Key
          </Label>
          <div className="relative">
            <Input
              id="kraken-api-secret"
              type={showSecret ? 'text' : 'password'}
              placeholder="Enter your Kraken private key"
              value={apiSecret}
              onChange={(e) => {
                setApiSecret(e.target.value);
                setFormDirty(true);
              }}
              className="bg-card border-border text-sm pr-10"
              disabled={connectionStatus === 'connected'}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showSecret ? 'Hide secret' : 'Show secret'}
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Never share this. Store safely.
          </p>
        </div>
      </div>

      {/* Required permissions info */}
      <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
        <p className="text-xs font-medium text-destructive mb-1.5">⚠️ Critical Security Note</p>
        <ul className="text-xs text-muted-foreground space-y-0.5 ml-3">
          <li>✓ Required: Query Funds (read balances)</li>
          <li>✓ Required: Query Open Orders & Trades</li>
          <li>✓ Required: Query Closed Orders & Trades</li>
          <li>✓ Required: Access WebSocket API</li>
          <li>✓ Required: Create & Modify Orders</li>
          <li>
            <strong className="text-destructive">✗ DO NOT enable: Fund Withdrawal</strong>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          Never give withdrawal permissions. This app does not support withdrawals.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {connectionStatus === 'connected' ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-xs"
            >
              Disconnect
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkKrakenStatus()}
              className="text-xs"
            >
              Check Status
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              onClick={handleSaveKeys}
              disabled={!formDirty || saving}
              className="text-xs gap-1.5 bg-primary hover:bg-primary/90"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              {saving ? 'Saving…' : 'Add Keys'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={!apiKey.trim() || !apiSecret.trim() || testing}
              className="text-xs gap-1.5"
            >
              {testing && <Loader2 className="w-3 h-3 animate-spin" />}
              {testing ? 'Testing…' : 'Test Connection'}
            </Button>
          </>
        )}
      </div>

      {/* Status message — shown when adding/editing keys */}
      {statusMessage && (connectionStatus !== 'connected' || showEditForm) && (
        <div className={cn(
          'p-3 rounded-lg text-xs font-medium transition-all',
          statusMessage.startsWith('✓') 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : statusMessage.includes('Saving') || statusMessage.includes('Testing')
            ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        )}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}