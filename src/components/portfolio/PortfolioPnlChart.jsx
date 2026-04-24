import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = [
  '#34d399', '#60a5fa', '#f59e0b', '#a78bfa', '#fb7185',
  '#22d3ee', '#f97316', '#84cc16', '#e879f9', '#38bdf8',
];

function fmt(v) {
  if (v === null || v === undefined) return '—';
  const abs = Math.abs(v);
  if (abs >= 1000) return `${v < 0 ? '-' : ''}$${(abs / 1000).toFixed(1)}k`;
  return `${v < 0 ? '-$' : '$'}${abs.toFixed(0)}`;
}

function fmtPct(v) {
  if (v === null || v === undefined) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill || p.color }}>
          {p.name}: <span className="font-mono">{p.name === 'PnL' ? fmt(p.value) : `${p.value?.toFixed(1)}%`}</span>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p style={{ color: d.payload.fill }} className="font-mono">{d.value?.toFixed(1)}% allocation</p>
    </div>
  );
};

export default function PortfolioPnlChart({ assets }) {
  const [tab, setTab] = useState('pnl');

  const pnlData = useMemo(() =>
    assets
      .filter(a => a.unrealized_pnl !== undefined && a.asset_symbol)
      .map(a => ({
        name: a.asset_symbol,
        PnL: parseFloat((a.unrealized_pnl || 0).toFixed(2)),
        pct: parseFloat((a.unrealized_pnl_pct || 0).toFixed(2)),
      }))
      .sort((a, b) => b.PnL - a.PnL),
    [assets]
  );

  const allocData = useMemo(() =>
    assets
      .filter(a => a.allocation_pct && a.allocation_pct > 0)
      .map((a, i) => ({
        name: a.asset_symbol,
        value: parseFloat((a.allocation_pct || 0).toFixed(1)),
        fill: COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value),
    [assets]
  );

  if (!assets.length) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Portfolio Snapshot</h3>
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {[['pnl', 'PnL'], ['alloc', 'Allocation']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                tab === key ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pnl' && (
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pnlData} barCategoryGap="25%">
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} />
              <Bar
                dataKey="PnL"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {pnlData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.PnL >= 0 ? 'hsl(142 70% 45% / 0.85)' : 'hsl(0 72% 51% / 0.85)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'alloc' && (
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="45%"
                outerRadius="75%"
                paddingAngle={2}
              >
                {allocData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                formatter={(value) => <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{value}</span>}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-asset PnL summary row */}
      {tab === 'pnl' && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pnlData.map((d) => (
            <div key={d.name} className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-mono',
              d.PnL >= 0
                ? 'bg-green-500/5 border-green-500/20 text-green-400'
                : 'bg-red-500/5 border-red-500/20 text-red-400'
            )}>
              <span className="text-foreground font-sans font-medium mr-1">{d.name}</span>
              {fmtPct(d.pct)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}