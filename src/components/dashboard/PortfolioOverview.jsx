import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const mockData = [
  { date: 'Mon', value: 45200 }, { date: 'Tue', value: 46100 },
  { date: 'Wed', value: 44800 }, { date: 'Thu', value: 47300 },
  { date: 'Fri', value: 48100 }, { date: 'Sat', value: 47600 },
  { date: 'Sun', value: 49250 },
];

export default function PortfolioOverview() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portfolio Value</p>
          <p className="text-3xl font-bold font-mono text-foreground mt-1">$49,250.00</p>
          <p className="text-sm text-green-400 font-mono mt-0.5">+$2,150.00 (4.56%) this week</p>
        </div>
        <div className="flex gap-2">
          {['1D', '1W', '1M', '3M'].map(period => (
            <button key={period} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${period === '1W' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
              {period}
            </button>
          ))}
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(168, 80%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(168, 80%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} />
            <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
            <Tooltip
              contentStyle={{ background: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 16%)', borderRadius: '8px', color: 'hsl(210, 40%, 96%)' }}
              formatter={(v) => [`$${v.toLocaleString()}`, 'Value']}
            />
            <Area type="monotone" dataKey="value" stroke="hsl(168, 80%, 50%)" strokeWidth={2} fill="url(#portfolioGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}