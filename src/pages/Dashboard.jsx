import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useKrakenOrderStatus } from '@/hooks/useKrakenOrderStatus';
import { DollarSign, TrendingUp, BarChart3, ShieldAlert, Activity, Zap, Cpu } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentSignals from '@/components/dashboard/RecentSignals';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import TradeApprovalWidget from '@/components/TradeApprovalWidget';
import KrakenSyncControls from '@/components/market/KrakenSyncControls';
import LiveDataControls from '@/components/market/LiveDataControls';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SignalBadge, PnlText } from '@/components/ui/signal-badge';
import { useAppPreferences } from '@/lib/AppPreferencesContext';

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [signals, setSignals] = useState([]);
  const [positions, setPositions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [riskSettings, setRiskSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [krakenLastSync, setKrakenLastSync] = useState(null);
  const [marketLastSync, setMarketLastSync] = useState(null);
  const { formatCurrency, t } = useAppPreferences();

  const loadData = async () => {
    const [p, s, pos, a, rs] = await Promise.all([
      base44.entities.PortfolioAsset.list('-updated_date', 50),
      base44.entities.AISignal.list('-created_date', 10),
      base44.entities.Position.filter({ status: 'open' }, '-created_date', 20),
      base44.entities.Alert.list('-created_date', 10),
      base44.entities.RiskSettings.list('-created_date', 1),
    ]);
    setPortfolio(p);
    setSignals(s);
    setPositions(pos);
    setAlerts(a);
    setRiskSettings(rs[0] || null);
    // Detect last sync times from data sources
    const krakenAsset = p.find(x => x.data_source === 'kraken' && x.last_synced);
    if (krakenAsset) setKrakenLastSync(krakenAsset.last_synced);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Auto-poll Kraken account every 30s if there are open exchange orders
  useKrakenOrderStatus({
    enabled: true,
    onUpdate: () => loadData(),
  });

  const totalValue = portfolio.reduce((s, a) => s + (a.current_value || 0), 0);
  const totalPnl = portfolio.reduce((s, a) => s + (a.unrealized_pnl || 0), 0);
  const totalPnlPct = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;
  const openPositionsCount = positions.length;
  const unreadAlerts = alerts.filter(a => !a.is_read).length;
  const activeBuySignals = signals.filter(s => s.signal_type === 'BUY' || s.signal_type === 'PARTIAL_BUY').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard_title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('dashboard_portfolio_value')}</p>
        </div>
        {riskSettings?.emergency_stop_active && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">{t('dashboard_capital_protection')}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title={t('dashboard_portfolio_value')}
          value={formatCurrency(totalValue)}
          subtitle={t('dashboard_holdings')}
          icon={DollarSign}
          accent={true}
          trendValue={totalPnlPct}
          trend={t('dashboard_all_time')}
        />
        <StatsCard
          title={t('dashboard_unrealized_pnl')}
          value={`${totalPnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(totalPnl))}`}
          subtitle={`${totalPnlPct.toFixed(2)}% ${t('dashboard_overall')}`}
          icon={TrendingUp}
          trendValue={totalPnlPct}
          trend={t('dashboard_unrealized')}
        />
        <StatsCard
          title={t('dashboard_open_positions')}
          value={openPositionsCount}
          subtitle={`${t('dashboard_max')}: ${riskSettings?.max_open_positions || 5}`}
          icon={Activity}
        />
        <StatsCard
          title={t('dashboard_active_signals')}
          value={activeBuySignals}
          subtitle={`${unreadAlerts} ${t('alerts_unread')}`}
          icon={Zap}
        />
      </div>

      {/* Data sync row — explicit source labeling */}
      <div className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-card/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Data Sources</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* CoinGecko = public market layer */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-[10px] text-blue-400/80 font-medium uppercase tracking-wider">Market Overview · CoinGecko</span>
            <LiveDataControls lastSyncedAt={marketLastSync} onSynced={() => loadData()} />
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          {/* Kraken REST = account/execution layer */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-[10px] text-orange-400/80 font-medium uppercase tracking-wider">Account & Balances · Kraken REST</span>
            <KrakenSyncControls lastSyncedAt={krakenLastSync} onSynced={(d) => { setKrakenLastSync(d.synced_at); loadData(); }} />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">Kraken WebSocket live prices: active on Positions &amp; Asset Detail pages</p>
      </div>

      {/* AI Scout trigger banner */}
      <Link to="/pipeline">
        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-foreground">AI Scout</div>
            <div className="text-xs text-muted-foreground">Run 3-agent market review · Market Watcher → Trade Planner → Risk Manager</div>
          </div>
          <Button size="sm" className="flex-shrink-0 h-8 text-xs px-3">
            Run
          </Button>
        </div>
      </Link>

      {/* Risk mode banner */}
      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-primary/20 bg-primary/5">
        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-foreground">{t('dashboard_trading_mode')}: </span>
          <span className="text-xs sm:text-sm text-primary font-mono uppercase">{riskSettings?.trading_mode || 'analysis_only'}</span>
        </div>
        <div className="flex-shrink-0">
          <Link to="/settings">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 px-2 sm:px-3">{t('global_edit')}</Button>
          </Link>
        </div>
      </div>

      {/* Pending Trade Approvals */}
      <TradeApprovalWidget />

      {/* Content grid */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <RecentSignals signals={signals} />
        <RecentAlerts alerts={alerts} />
      </div>

      {/* Open Positions preview */}
      {positions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm font-semibold text-foreground">{t('dashboard_open_positions')}</h3>
            <Link to="/positions">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">{t('dashboard_view_all')}</Button>
            </Link>
          </div>
          {/* Mobile: compact card list */}
          <div className="sm:hidden space-y-2">
            {positions.slice(0, 5).map(pos => (
              <div key={pos.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                   <p className="font-semibold text-sm text-foreground">{pos.asset_symbol}</p>
                   <p className="text-xs text-muted-foreground font-mono">{formatCurrency(pos.entry_price)} → {formatCurrency(pos.current_price)}</p>
                </div>
                <div className="text-right">
                  <PnlText value={pos.unrealized_pnl_pct} suffix="%" />
                  <p className="text-xs text-muted-foreground">{t('dashboard_risk_pct')} {pos.risk_pct?.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left pb-2 font-medium">Asset</th>
                  <th className="text-right pb-2 font-medium">{t('dashboard_entry')}</th>
                  <th className="text-right pb-2 font-medium">{t('dashboard_current')}</th>
                  <th className="text-right pb-2 font-medium">{t('dashboard_pnl')}</th>
                  <th className="text-right pb-2 font-medium">{t('dashboard_risk_label')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {positions.slice(0, 5).map(pos => (
                  <tr key={pos.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-semibold text-foreground">{pos.asset_symbol}</td>
                     <td className="py-2.5 text-right font-mono text-muted-foreground text-xs">{formatCurrency(pos.entry_price)}</td>
                     <td className="py-2.5 text-right font-mono text-xs">{formatCurrency(pos.current_price)}</td>
                    <td className="py-2.5 text-right"><PnlText value={pos.unrealized_pnl_pct} suffix="%" /></td>
                    <td className="py-2.5 text-right text-xs text-muted-foreground font-mono">{pos.risk_pct?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Portfolio summary */}
      {portfolio.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm font-semibold text-foreground">{t('dashboard_holdings')}</h3>
            <Link to="/portfolio">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">{t('dashboard_view_all')}</Button>
            </Link>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {portfolio.slice(0, 5).map(asset => (
              <div key={asset.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {asset.asset_symbol?.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{asset.asset_symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">{asset.quantity} {t('dashboard_units')}</div>
                </div>
                <div className="text-right flex-shrink-0">
                   <div className="text-sm font-mono font-semibold text-foreground">
                     {formatCurrency(asset.current_value)}
                   </div>
                   <PnlText value={asset.unrealized_pnl_pct} suffix="%" />
                </div>
                <div className="text-xs text-muted-foreground font-mono w-10 text-right flex-shrink-0 hidden sm:block">
                  {asset.allocation_pct?.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}