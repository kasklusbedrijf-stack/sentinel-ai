import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignalBadge from '@/components/dashboard/SignalBadge';
import ScoreBar from '@/components/dashboard/ScoreBar';
import PriceChange from '@/components/dashboard/PriceChange';
import { cn } from '@/lib/utils';

const trendColors = {
  strong_bullish: 'text-green-400 bg-green-400/10',
  bullish: 'text-emerald-400 bg-emerald-400/10',
  neutral: 'text-blue-400 bg-blue-400/10',
  bearish: 'text-orange-400 bg-orange-400/10',
  strong_bearish: 'text-red-400 bg-red-400/10',
};

export default function AssetDetail() {
  const { id } = useParams();

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const all = await base44.entities.Asset.filter({ id });
      return all[0];
    },
    enabled: !!id,
  });

  const { data: signals = [] } = useQuery({
    queryKey: ['signals', id],
    queryFn: () => base44.entities.AISignal.filter({ asset_symbol: asset?.symbol }),
    enabled: !!asset?.symbol,
  });

  const latestSignal = signals[0];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!asset) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Asset not found.</p>
      <Link to="/market"><Button className="mt-4" variant="outline">Back to Market</Button></Link>
    </div>
  );

  const trendCls = trendColors[asset.trend_status] || 'text-muted-foreground bg-secondary';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/market">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          {asset.image_url && <img src={asset.image_url} className="w-10 h-10 rounded-full" alt={asset.symbol} />}
          <div>
            <h1 className="text-xl font-bold text-foreground">{asset.name} <span className="text-muted-foreground font-normal">({asset.symbol})</span></h1>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', trendCls)}>
              {asset.trend_status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-mono text-foreground">${asset.current_price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
          <PriceChange value={asset.change_24h} className="justify-end" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technical Indicators */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wider">Technical Indicators</h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'RSI', value: asset.rsi?.toFixed(1) ?? '—' },
              { label: 'MACD', value: asset.macd_signal ?? '—' },
              { label: 'EMA 20', value: asset.ema_20 ? `$${asset.ema_20.toLocaleString()}` : '—' },
              { label: 'EMA 50', value: asset.ema_50 ? `$${asset.ema_50.toLocaleString()}` : '—' },
              { label: 'EMA 200', value: asset.ema_200 ? `$${asset.ema_200.toLocaleString()}` : '—' },
              { label: 'Volatility', value: asset.volatility ? `${asset.volatility}/100` : '—' },
            ].map((item) => (
              <div key={item.label} className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-mono font-medium text-foreground mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Support</span>
              <span className="font-mono text-success">${asset.support_level?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Resistance</span>
              <span className="font-mono text-destructive">${asset.resistance_level?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume 24H</span>
              <span className="font-mono text-foreground">${(asset.volume_24h / 1e6)?.toFixed(1)}M</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Market Cap</span>
              <span className="font-mono text-foreground">${(asset.market_cap / 1e9)?.toFixed(2)}B</span>
            </div>
          </div>

          {/* Price changes */}
          <div className="space-y-2 pt-2 border-t border-border">
            {[
              { label: '1H Change', val: asset.change_1h },
              { label: '24H Change', val: asset.change_24h },
              { label: '7D Change', val: asset.change_7d },
            ].map((c) => (
              <div key={c.label} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <PriceChange value={c.val} />
              </div>
            ))}
          </div>
        </div>

        {/* AI Signal */}
        <div className="lg:col-span-2 space-y-4">
          {latestSignal ? (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Latest AI Signal</p>
                  <div className="flex items-center gap-2">
                    <SignalBadge type={latestSignal.signal_type} />
                    <span className="text-xs text-muted-foreground">Timeframe: {latestSignal.timeframe}</span>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <ScoreBar label="Confidence" value={latestSignal.confidence_score} colorFn={(v) => v >= 70 ? 'bg-success' : v >= 50 ? 'bg-warning' : 'bg-destructive'} />
                  <ScoreBar label="Risk Score" value={latestSignal.risk_score} colorFn={(v) => v >= 70 ? 'bg-destructive' : v >= 40 ? 'bg-warning' : 'bg-success'} />
                  <ScoreBar label="Trend" value={latestSignal.trend_score} />
                </div>
                <div className="space-y-3">
                  <ScoreBar label="Momentum" value={latestSignal.momentum_score} />
                  <ScoreBar label="Volume" value={latestSignal.volume_score} />
                  <ScoreBar label="Technical Setup" value={latestSignal.technical_score} />
                </div>
              </div>

              {/* Trade Plan */}
              {(latestSignal.suggested_entry || latestSignal.suggested_stop_loss) && (
                <div className="grid grid-cols-4 gap-3 p-3 bg-secondary/50 rounded-lg mb-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Entry</p>
                    <p className="text-sm font-mono font-semibold text-foreground">${latestSignal.suggested_entry?.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
                    <p className="text-sm font-mono font-semibold text-destructive">${latestSignal.suggested_stop_loss?.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">TP1</p>
                    <p className="text-sm font-mono font-semibold text-success">${latestSignal.suggested_tp1?.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">TP2</p>
                    <p className="text-sm font-mono font-semibold text-success">${latestSignal.suggested_tp2?.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-foreground font-medium">{latestSignal.summary}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{latestSignal.detailed_explanation}</p>
              </div>

              <div className="flex gap-3 mt-4">
                <Button className="flex-1 bg-success/20 text-success hover:bg-success/30 border border-success/30">
                  Accept Trade Plan
                </Button>
                <Button variant="outline" className="flex-1">
                  Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">No AI signals for this asset yet.</p>
              <p className="text-xs text-muted-foreground mt-2">Ask the Trade Planner agent to analyze {asset.symbol}.</p>
            </div>
          )}

          {/* All signals for this asset */}
          {signals.length > 1 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">Signal History</h3>
              <div className="space-y-2">
                {signals.slice(1, 6).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <SignalBadge type={s.signal_type} />
                      <span className="text-xs text-muted-foreground">{s.timeframe}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Conf: <span className="text-foreground">{s.confidence_score}</span></span>
                      <span>Risk: <span className="text-foreground">{s.risk_score}</span></span>
                      <span className="capitalize">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}