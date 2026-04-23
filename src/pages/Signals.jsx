import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAppPreferences } from '@/lib/AppPreferencesContext';

const signalColors = {
  BUY: 'text-green-400 bg-green-400/10 border-green-400/20',
  PARTIAL_BUY: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  HOLD: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  WAIT: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  PARTIAL_SELL: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  SELL: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const statusColors = {
  active: 'text-green-400 bg-green-400/10 border-green-400/20',
  executed: 'text-primary bg-primary/10 border-primary/20',
  expired: 'text-muted-foreground bg-muted border-muted/20',
  rejected: 'text-destructive bg-destructive/10 border-destructive/20',
};

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const { formatCurrency } = useAppPreferences();

  useEffect(() => {
    base44.entities.AISignal.list('-created_date', 100).then(d => { setSignals(d); setLoading(false); });
  }, []);

  const filtered = signals.filter(s => {
    const matchType = filterType === 'all' || s.signal_type === filterType;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchType && matchStatus;
  });

  const handleStatusChange = async (signal, newStatus) => {
    await base44.entities.AISignal.update(signal.id, { status: newStatus });
    setSignals(prev => prev.map(s => s.id === signal.id ? { ...s, status: newStatus } : s));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-primary" /> AI Signals</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-generated trading signals with full explainability</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 sm:w-40 bg-card border-border text-sm h-9"><SelectValue placeholder="Signal type" /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            {['all', 'BUY', 'PARTIAL_BUY', 'HOLD', 'WAIT', 'PARTIAL_SELL', 'SELL'].map(t => (
              <SelectItem key={t} value={t}>{t === 'all' ? 'All Types' : t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 sm:w-36 bg-card border-border text-sm h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            {['all', 'active', 'executed', 'expired', 'rejected'].map(s => (
              <SelectItem key={s} value={s}>{s === 'all' ? 'All Status' : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="px-3 py-1.5 font-mono text-xs">{filtered.length} signals</Badge>
      </div>

      {filtered.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No signals found. Use the Trade Planner agent to generate signals.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.map(signal => (
          <Card key={signal.id} className="bg-card border-border overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => setExpanded(expanded === signal.id ? null : signal.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <span className={cn("text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg border font-mono whitespace-nowrap flex-shrink-0 mt-0.5", signalColors[signal.signal_type])}>
                    {signal.signal_type}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-sm">{signal.asset_symbol} <span className="text-muted-foreground font-normal text-xs">{signal.asset_name}</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 sm:truncate sm:max-w-sm">{signal.summary}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <div className="text-center hidden xs:block">
                    <div className="text-[10px] text-muted-foreground">Conf.</div>
                    <div className="text-sm font-bold font-mono text-primary">{signal.confidence_score}%</div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="text-[10px] text-muted-foreground">Risk</div>
                    <div className={cn("text-sm font-bold font-mono", (signal.risk_score || 0) > 70 ? 'text-red-400' : (signal.risk_score || 0) > 40 ? 'text-yellow-400' : 'text-green-400')}>
                      {signal.risk_score}
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border hidden sm:inline", statusColors[signal.status])}>
                    {signal.status}
                  </span>
                  {expanded === signal.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              {/* Mobile: confidence + status below */}
              <div className="flex items-center gap-3 mt-2 sm:hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">Conf.</span>
                  <span className="text-xs font-bold font-mono text-primary">{signal.confidence_score}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">Risk</span>
                  <span className={cn("text-xs font-bold font-mono", (signal.risk_score || 0) > 70 ? 'text-red-400' : (signal.risk_score || 0) > 40 ? 'text-yellow-400' : 'text-green-400')}>{signal.risk_score}</span>
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border", statusColors[signal.status])}>
                  {signal.status}
                </span>
              </div>
            </div>

            {expanded === signal.id && (
              <div className="border-t border-border p-4 space-y-4 bg-secondary/20">
                {/* Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    ['Trend', signal.trend_score],
                    ['Momentum', signal.momentum_score],
                    ['Volume', signal.volume_score],
                    ['Technical', signal.technical_score],
                    ['Context', signal.market_context_score],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-card rounded-lg p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">{l}</div>
                      <div className="text-lg font-bold font-mono text-primary">{v ?? '—'}</div>
                    </div>
                  ))}
                </div>

                {/* Trade levels */}
                 {signal.suggested_entry && (
                   <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                     {[
                       ['Entry', signal.suggested_entry, 'text-foreground'],
                       ['Stop Loss', signal.suggested_stop_loss, 'text-red-400'],
                       ['TP1', signal.suggested_tp1, 'text-green-400'],
                       ['TP2', signal.suggested_tp2, 'text-green-400'],
                       ['TP3', signal.suggested_tp3, 'text-green-400'],
                     ].map(([l, v, c]) => v && (
                       <div key={l} className="bg-card rounded-lg p-2.5 text-center">
                         <div className="text-muted-foreground mb-1">{l}</div>
                         <div className={cn("font-mono font-semibold", c)}>{formatCurrency(v)}</div>
                       </div>
                     ))}
                   </div>
                 )}

                {/* RR ratio */}
                {signal.reward_risk_ratio && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="text-muted-foreground">R:R: <span className="font-mono font-bold text-primary">{signal.reward_risk_ratio.toFixed(2)}:1</span></span>
                    {signal.suggested_position_size_pct && (
                      <span className="text-muted-foreground">Size: <span className="font-mono font-bold text-foreground">{signal.suggested_position_size_pct.toFixed(1)}%</span></span>
                    )}
                    {signal.timeframe && (
                      <span className="text-muted-foreground">TF: <span className="font-mono font-bold text-foreground">{signal.timeframe}</span></span>
                    )}
                  </div>
                )}

                {/* Explanation */}
                {signal.detailed_explanation && (
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">AI Explanation</div>
                    <p className="text-sm text-foreground leading-relaxed">{signal.detailed_explanation}</p>
                  </div>
                )}

                {/* Actions */}
                {signal.status === 'active' && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => handleStatusChange(signal, 'executed')} className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-xs">Accept & Execute</Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(signal, 'rejected')} className="text-xs">Reject</Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(signal, 'expired')} className="text-xs">Expire</Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}