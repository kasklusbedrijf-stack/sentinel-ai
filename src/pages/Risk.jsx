import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, Save, Power } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const defaults = {
  max_risk_per_trade_pct: 2, max_daily_loss_pct: 5, max_open_positions: 5,
  max_single_coin_exposure_pct: 25, max_alt_exposure_pct: 50, allow_auto_trading: false,
  block_memecoins: true, block_high_risk: true, auto_pause_after_losses: 3,
  min_confidence_threshold: 65, max_risk_score_threshold: 70, min_rr_ratio: 2,
  trading_mode: 'analysis_only', emergency_stop_active: false,
};

function SettingSlider({ label, description, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <span className="font-mono font-bold text-primary text-lg">{value}{unit}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="w-full" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function Risk() {
  const [settings, setSettings] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useAppPreferences();
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.RiskSettings.list('-created_date', 1).then(data => {
      if (data.length > 0) { setSettings(data[0]); setSettingsId(data[0].id); }
      else setSettings(defaults);
      setLoading(false);
    });
  }, []);

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true);
    if (settingsId) {
      await base44.entities.RiskSettings.update(settingsId, settings);
    } else {
      const created = await base44.entities.RiskSettings.create(settings);
      setSettingsId(created.id);
    }
    setSaving(false);
    toast({ title: 'Risk settings saved', description: 'Your risk rules have been updated.' });
  };

  const triggerEmergencyStop = async () => {
    const newVal = !settings.emergency_stop_active;
    update('emergency_stop_active', newVal);
    if (settingsId) await base44.entities.RiskSettings.update(settingsId, { emergency_stop_active: newVal });
    await base44.entities.Alert.create({
      type: 'emergency', severity: 'critical',
      title: newVal ? '🚨 Emergency Stop ACTIVATED' : '✅ Emergency Stop Deactivated',
      message: newVal ? 'All automated trading has been blocked.' : 'Trading has been resumed.',
    });
    await base44.entities.AuditLog.create({
      action: 'emergency_stop', severity: 'critical',
      details: newVal ? 'Emergency stop activated by user.' : 'Emergency stop deactivated by user.',
    });
    toast({ title: newVal ? '🚨 Emergency Stop Activated' : 'Emergency Stop Deactivated', variant: newVal ? 'destructive' : 'default' });
  };

  if (loading || !settings) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> {t('risk_settings')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('dashboard_capital_protection')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={triggerEmergencyStop}
            variant={settings.emergency_stop_active ? "destructive" : "outline"}
            size="sm"
            className={cn("gap-2 flex-1 sm:flex-none", settings.emergency_stop_active && "animate-pulse")}
          >
            <Power className="w-4 h-4" />
            <span className="hidden xs:inline">{settings.emergency_stop_active ? 'Emergency STOP ON' : 'Emergency Stop'}</span>
            <span className="xs:hidden">{settings.emergency_stop_active ? 'STOP ON' : 'E-Stop'}</span>
          </Button>
          <Button onClick={save} disabled={saving} size="sm" className="gap-2 flex-1 sm:flex-none">
            <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {settings.emergency_stop_active && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <div className="font-semibold text-destructive">Emergency Stop is ACTIVE</div>
            <div className="text-sm text-muted-foreground">All automated trading is blocked. Manual approval is still available.</div>
          </div>
        </div>
      )}

      {/* Trading Mode */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Trading Mode</CardTitle>
          <CardDescription className="text-xs">Controls how the AI interacts with trade execution</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { mode: 'analysis_only', label: 'Analysis Only', desc: 'AI analyzes only. No orders.', color: 'border-blue-400/40 bg-blue-400/5 text-blue-400' },
            { mode: 'semi_auto', label: 'Semi-Auto', desc: 'AI suggests, you approve.', color: 'border-yellow-400/40 bg-yellow-400/5 text-yellow-400' },
            { mode: 'auto', label: 'Auto Trading', desc: 'AI executes under risk rules.', color: 'border-red-400/40 bg-red-400/5 text-red-400' },
          ].map(({ mode, label, desc, color }) => (
            <button
              key={mode}
              onClick={() => update('trading_mode', mode)}
              className={cn("p-4 rounded-xl border-2 text-left transition-all", settings.trading_mode === mode ? color : 'border-border hover:border-border/80')}
            >
              <div className="font-semibold text-sm">{label}</div>
              <div className="text-xs text-muted-foreground mt-1">{desc}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position Risk */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Position Risk Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingSlider label="Max Risk Per Trade" description="% of portfolio risked per trade" value={settings.max_risk_per_trade_pct} min={0.5} max={10} step={0.5} unit="%" onChange={v => update('max_risk_per_trade_pct', v)} />
            <SettingSlider label="Max Daily Loss" description="Stop trading after % daily drawdown" value={settings.max_daily_loss_pct} min={1} max={20} step={0.5} unit="%" onChange={v => update('max_daily_loss_pct', v)} />
            <SettingSlider label="Max Open Positions" description="Maximum concurrent open trades" value={settings.max_open_positions} min={1} max={20} onChange={v => update('max_open_positions', v)} />
            <SettingSlider label="Auto-Pause After Losses" description="Pause after N consecutive losing trades" value={settings.auto_pause_after_losses} min={1} max={10} onChange={v => update('auto_pause_after_losses', v)} />
          </CardContent>
        </Card>

        {/* Exposure Limits */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Exposure Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingSlider label="Max Single Coin Exposure" description="Max % of portfolio in one asset" value={settings.max_single_coin_exposure_pct} min={5} max={100} step={5} unit="%" onChange={v => update('max_single_coin_exposure_pct', v)} />
            <SettingSlider label="Max Altcoin Exposure" description="Max total % in altcoins" value={settings.max_alt_exposure_pct} min={10} max={100} step={5} unit="%" onChange={v => update('max_alt_exposure_pct', v)} />
            <SettingSlider label="Min Confidence Threshold" description="Minimum AI confidence to act" value={settings.min_confidence_threshold} min={30} max={95} unit="%" onChange={v => update('min_confidence_threshold', v)} />
            <SettingSlider label="Min R:R Ratio" description="Minimum reward/risk ratio required" value={settings.min_rr_ratio} min={1} max={10} step={0.5} onChange={v => update('min_rr_ratio', v)} />
          </CardContent>
        </Card>
      </div>

      {/* Toggle settings */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Asset Filters & Safety</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'block_memecoins', label: 'Block Memecoins', desc: 'Prevent trading meme category assets' },
            { key: 'block_high_risk', label: 'Block High-Risk', desc: 'Block assets with high risk score' },
            { key: 'allow_auto_trading', label: 'Allow Auto Trading', desc: 'Enable automated order execution' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
              <Switch checked={!!settings[key]} onCheckedChange={v => update(key, v)} id={key} className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor={key} className="text-sm font-medium cursor-pointer">{label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}