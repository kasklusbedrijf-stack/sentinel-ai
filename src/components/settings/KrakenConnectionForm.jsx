import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function KrakenConnectionForm({ onConnectionStatusChange }) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unchecked'); // unchecked | testing | connected | failed | not_configured
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

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
      } else {
        setConnectionStatus('failed');
        setTestResult({ error: res.data?.error || 'Unable to verify connection' });
      }
    } catch (e) {
      setConnectionStatus('failed');
      setTestResult({ error: e.message });
    }
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
        setStatusMessage('✓ Connected successfully!');
        toast.success('Kraken connection verified!');
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
  };

  return (
    <div className="space-y-4">
      {/* Status indicator */}
      {connectionStatus === 'connected' && (
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

      {connectionStatus === 'not_configured' && (
        <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-400">Not Configured</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add your Kraken API keys below to connect your account.</p>
          </div>
        </div>
      )}

      {connectionStatus === 'failed' && testResult?.error && (
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 flex items-start gap-2">
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

      {/* Status message — persistent card that's always visible during save/test */}
      {statusMessage && (
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

      {/* Test result */}
      {testResult && testResult.success && (
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
          <p className="text-xs text-green-400">
            ✓ Connection successful · {testResult.balance_count} holdings · {testResult.open_order_count} open orders
          </p>
        </div>
      )}
    </div>
  );
}