import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp, BarChart3, ShieldAlert, Activity, Zap } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentSignals from '@/components/dashboard/RecentSignals';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SignalBadge, PnlText } from '@/components/ui/signal-badge';

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [signals, setSignals] = useState([]);
  const [positions, setPositions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [riskSettings, setRiskSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, s, pos, a, rs] = await Promise.all([
        base44.entities.PortfolioAsset.list('-updated_date', 50),
        base44.entities.AISignal.list('-created_date', 10),
        base44.entities.Position.filter({ status: 'OPEN' }, '-created_date', 20),
        base44.entities.Alert.list('-created_date', 10),
        base44.entities.RiskSettings.list('-created_date', 1),
      ]);
      setPortfolio(p);
      setSignals(s);
      setPositions(pos);
      setAlerts(a);
      setRiskSettings(rs[0] || null);
      setLoading(false);
    }
    load();
  }, []);

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
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Portfolio overview & market intelligence</p>
        </div>
        {riskSettings?.emergency_stop_active && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Emergency Stop Active</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Portfolio Value"
          value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Total holdings"
          icon={DollarSign}
          accent={true}
          trendValue={totalPnlPct}
          trend="all time"
        />
        <StatsCard
          title="Unrealized PnL"
          value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`}
          subtitle={`${totalPnlPct.toFixed(2)}% overall`}
          icon={TrendingUp}
          trendValue={totalPnlPct}
          trend="unrealized"
        />
        <StatsCard
          title="Open Positions"
          value={openPositionsCount}
          subtitle={`Max: ${riskSettings?.max_open_positions || 5}`}
          icon={Activity}
        />
        <StatsCard
          title="Active Signals"
          value={activeBuySignals}
          subtitle={`${unreadAlerts} unread alerts`}
          icon={Zap}
        />
      </div>

      {/* Risk mode banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
        <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
        <div>
          <span className="text-sm font-semibold text-foreground">Trading Mode: </span>
          <span className="text-sm text-primary font-mono uppercase">{riskSettings?.trading_mode || 'analysis_only'}</span>
        </div>
        <div className="ml-auto">
          <Link to="/settings">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">Change Mode</Button>
          </Link>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <RecentSignals signals={signals} />
        <RecentAlerts alerts={alerts} />
      </div>

      {/* Open Positions preview */}
      {positions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm font-semibold text-foreground">Open Positions</h3>
            <Link to="/positions">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">View all</Button>
            </Link>
          </div>
          {/* Mobile: compact card list */}
          <div className="sm:hidden space-y-2">
            {positions.slice(0, 5).map(pos => (
              <div key={pos.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="font-semibold text-sm text-foreground">{pos.asset_symbol}</p>
                  <p className="text-xs text-muted-foreground font-mono">${pos.entry_price?.toFixed(2)} → ${pos.current_price?.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <PnlText value={pos.unrealized_pnl_pct} suffix="%" />
                  <p className="text-xs text-muted-foreground">Risk {pos.risk_pct?.toFixed(1)}%</p>
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
                  <th className="text-right pb-2 font-medium">Entry</th>
                  <th className="text-right pb-2 font-medium">Current</th>
                  <th className="text-right pb-2 font-medium">PnL</th>
                  <th className="text-right pb-2 font-medium">Risk%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {positions.slice(0, 5).map(pos => (
                  <tr key={pos.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-semibold text-foreground">{pos.asset_symbol}</td>
                    <td className="py-2.5 text-right font-mono text-muted-foreground text-xs">${pos.entry_price?.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono text-xs">${pos.current_price?.toFixed(2)}</td>
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
            <h3 className="text-sm font-semibold text-foreground">Portfolio Holdings</h3>
            <Link to="/portfolio">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">Full Portfolio</Button>
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
                  <div className="text-xs text-muted-foreground truncate">{asset.quantity} units</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-mono font-semibold text-foreground">
                    ${asset.current_value?.toFixed(2)}
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