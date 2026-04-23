import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, ShieldAlert, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RiskSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(null);

  const { data: riskSettings = [] } = useQuery({
    queryKey: ['risk-settings'],
    queryFn: () => base44.entities.RiskSettings.list('-created_date', 1),
  });

  useEffect(() => {
    if (riskSettings.length > 0) {
      setSettings(riskSettings[0]);
    } else {
      setSettings({
        max_risk_per_trade_pct: 2,
        max_daily_loss_pct: 5,
        max_open_positions: 5,
        max_single_coin_exposure_pct: 25,
        max_alt_exposure_pct: 50,
        allow_auto_trading: false,
        block_memecoins: true,
        block_high_risk: true,
        auto_pause_after_losses: 3,
        min_confidence_threshold: 65,
        max_risk_score_threshold: 70,
        min_rr_ratio: 2,
        trading_mode: 'analysis_only',
        emergency_stop_active: false,
      });
    }
  }, [riskSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return base44.entities.RiskSettings.update(data.id, data);
      }
      return base44.entities.RiskSettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-settings'] });
      toast.success('Risk settings saved');
    },
  });

  if (!settings) return null;

  const updateField = (field, value) => setSettings(prev => ({ ...prev, [field]: value }));

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Risk Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure risk management rules to protect your capital</p>
        </div>
        <Button onClick={() => saveMutation.mutate(settings)} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-2" /> Save Settings
        </Button>
      </div>

      {/* Emergency Stop */}
      <div className={cn(
        "rounded-xl border p-5",
        settings.emergency_stop_active ? "border-red-400/50 bg-red-400/5" : "border-border bg-card"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className={cn("w-5 h-5", settings.emergency_stop_active ? "text-red-400" : "text-muted-foreground")} />
            <div>
              <p className="text-sm font-semibold text-foreground">Emergency Stop</p>
              <p className="text-xs text-muted-foreground">Blocks all automated trading when active</p>
            </div>
          </div>
          <Switch checked={settings.emergency_stop_active} onCheckedChange={v => updateField('emergency_stop_active', v)} />
        </div>
      </div>

      {/* Trading Mode */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Trading Mode</h3>
        <Select value={settings.trading_mode} onValueChange={v => updateField('trading_mode', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="analysis_only">Analysis Only — No trade execution</SelectItem>
            <SelectItem value="semi_auto">Semi-Auto — AI plans, you approve</SelectItem>
            <SelectItem value="auto">Auto — AI executes (restricted)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Risk Limits */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Risk Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { field: 'max_risk_per_trade_pct', label: 'Max risk per trade (%)', type: 'number' },
            { field: 'max_daily_loss_pct', label: 'Max daily loss (%)', type: 'number' },
            { field: 'max_open_positions', label: 'Max open positions', type: 'number' },
            { field: 'max_single_coin_exposure_pct', label: 'Max single coin exposure (%)', type: 'number' },
            { field: 'max_alt_exposure_pct', label: 'Max altcoin exposure (%)', type: 'number' },
            { field: 'auto_pause_after_losses', label: 'Pause after N consecutive losses', type: 'number' },
          ].map(({ field, label, type }) => (
            <div key={field} className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                type={type}
                value={settings[field] || ''}
                onChange={e => updateField(field, Number(e.target.value))}
                className="bg-background border-border font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* AI Thresholds */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">AI Signal Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Min confidence score</Label>
            <Input type="number" value={settings.min_confidence_threshold || ''} onChange={e => updateField('min_confidence_threshold', Number(e.target.value))} className="bg-background border-border font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max risk score</Label>
            <Input type="number" value={settings.max_risk_score_threshold || ''} onChange={e => updateField('max_risk_score_threshold', Number(e.target.value))} className="bg-background border-border font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Min reward/risk ratio</Label>
            <Input type="number" step="0.1" value={settings.min_rr_ratio || ''} onChange={e => updateField('min_rr_ratio', Number(e.target.value))} className="bg-background border-border font-mono" />
          </div>
        </div>
      </div>

      {/* Safety Toggles */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Safety Rules</h3>
        <div className="space-y-4">
          {[
            { field: 'block_memecoins', label: 'Block Memecoins', desc: 'Prevent trading meme tokens' },
            { field: 'block_high_risk', label: 'Block High-Risk Assets', desc: 'Skip assets with risk score > threshold' },
            { field: 'allow_auto_trading', label: 'Allow Auto Trading', desc: 'Enable AI to execute trades automatically (requires strict risk controls)' },
          ].map(({ field, label, desc }) => (
            <div key={field} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch checked={settings[field]} onCheckedChange={v => updateField(field, v)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}