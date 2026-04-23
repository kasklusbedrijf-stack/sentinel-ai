import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  approved: 'bg-green-400/10 text-green-400 border-green-400/20',
  rejected: 'bg-red-400/10 text-red-400 border-red-400/20',
  executed: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
  failed: 'bg-red-400/10 text-red-400 border-red-400/20',
};

export default function Trade() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['trade-orders'],
    queryFn: () => base44.entities.TradeOrder.list('-created_date', 50),
  });

  const pending = orders.filter(o => o.status === 'pending');
  const history = orders.filter(o => o.status !== 'pending');

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Trade</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve trade plans from AI agents</p>
      </div>

      {/* Pending Orders */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Pending Approval ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No pending trades. The Trade Planner agent will create trade plans for your review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map(order => (
              <div key={order.id} className="rounded-xl border border-primary/20 bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {order.asset_symbol?.substring(0, 3)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{order.asset_symbol}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.side} • {order.order_type}</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">Pending</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Entry</span><p className="font-mono font-semibold mt-0.5">${order.price?.toLocaleString()}</p></div>
                  <div><span className="text-red-400">SL</span><p className="font-mono font-semibold mt-0.5">${order.stop_loss?.toLocaleString()}</p></div>
                  <div><span className="text-green-400">TP1</span><p className="font-mono font-semibold mt-0.5">${order.tp1?.toLocaleString()}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Risk</span><p className="font-mono font-semibold mt-0.5">${order.estimated_risk?.toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">Reward</span><p className="font-mono font-semibold mt-0.5">${order.estimated_reward?.toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">R:R</span><p className="font-mono font-semibold mt-0.5">{order.rr_ratio?.toFixed(1)}</p></div>
                </div>
                {order.notes && <p className="text-xs text-muted-foreground">{order.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order History */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Order History</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Asset</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Qty</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">R:R</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-12 text-muted-foreground">No trade history</td></tr>
                ) : (
                  history.map(order => (
                    <tr key={order.id} className="border-b border-border/50">
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{order.asset_symbol}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{order.side} • {order.order_type}</td>
                      <td className="text-right px-4 py-3 font-mono text-sm">${order.price?.toLocaleString()}</td>
                      <td className="text-right px-4 py-3 font-mono text-sm">{order.quantity}</td>
                      <td className="text-right px-4 py-3 font-mono text-sm">{order.rr_ratio?.toFixed(1)}</td>
                      <td className="text-center px-4 py-3">
                        <Badge className={cn("text-[10px] border", statusColors[order.status])}>{order.status}</Badge>
                      </td>
                      <td className="text-right px-4 py-3 text-xs text-muted-foreground">
                        {order.created_date && format(new Date(order.created_date), 'MMM d, HH:mm')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}