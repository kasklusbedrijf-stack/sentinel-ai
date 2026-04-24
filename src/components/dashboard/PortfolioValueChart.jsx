import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

export default function PortfolioValueChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d'); // 7d, 30d, 90d, all
  const { formatCurrency, t } = useAppPreferences();

  useEffect(() => {
    loadChartData();
  }, [period]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();

      if (period === '7d') startDate.setDate(now.getDate() - 7);
      else if (period === '30d') startDate.setDate(now.getDate() - 30);
      else if (period === '90d') startDate.setDate(now.getDate() - 90);
      else startDate = new Date('2020-01-01'); // all

      const history = await base44.entities.PortfolioValueHistory.filter(
        { date: { $gte: startDate.toISOString() } },
        'date',
        500
      );

      const formatted = history.map(h => ({
        date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: h.total_value,
        pnl: h.total_pnl,
        timestamp: h.date,
      }));

      setData(formatted);
    } catch (err) {
      console.error('Failed to load chart data:', err);
    }
    setLoading(false);
  };

  const minValue = Math.min(...data.map(d => d.value), Infinity);
  const maxValue = Math.max(...data.map(d => d.value), -Infinity);
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const change = lastValue - firstValue;
  const changePct = firstValue > 0 ? (change / firstValue) * 100 : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {t('dashboard_portfolio_growth') || 'Portfolio Value Growth'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{t('dashboard_historical_value') || 'Historical value tracking'}</p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 flex-wrap">
        {['7d', '30d', '90d', 'all'].map(p => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
            className="text-xs h-8 px-3"
          >
            {p === '7d' ? '7D' : p === '30d' ? '30D' : p === '90d' ? '90D' : 'All'}
          </Button>
        ))}
      </div>

      {/* Chart stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">{t('dashboard_current') || 'Current'}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{formatCurrency(lastValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('dashboard_change') || 'Change'}</p>
            <p className={`text-sm font-bold mt-0.5 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{formatCurrency(change)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">%</p>
            <p className={`text-sm font-bold mt-0.5 ${changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t('dashboard_no_history') || 'No historical data yet. Check back after portfolio changes.'}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value) => formatCurrency(value)}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            />
            <Legend wrapperStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              activeDot={{ r: 5 }}
              strokeWidth={2}
              isAnimationActive={true}
              name="Portfolio Value"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}