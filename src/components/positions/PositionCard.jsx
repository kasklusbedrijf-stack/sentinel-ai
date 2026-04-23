import { TrendingUp, TrendingDown, Shield, Target, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PnlText } from '@/components/ui/signal-badge';

export default function PositionCard({ position, onClose, onPartialClose }) {
  const isProfit = (position.unrealized_pnl || 0) >= 0;

  return (
    <div className="rounded-xl border bg-card overflow-hidden hover:border-primary/20 transition-colors"
      style={{ borderColor: isProfit ? 'hsl(142 70% 45% / 0.2)' : 'hsl(0 72% 51% / 0.2)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-primary">
            {position.asset_symbol?.slice(0, 2)}
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{position.asset_symbol}</div>
            <div className="text-xs text-muted-foreground">{position.status}</div>
          </div>
        </div>
        <div className="text-right">
          <PnlText value={position.unrealized_pnl} suffix=" $" />
          <div className="text-xs text-muted-foreground mt-0.5">
            <PnlText value={position.unrealized_pnl_pct} suffix="%" />
          </div>
        </div>
      </div>

      {/* Prices grid */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-2.5 rounded-lg bg-muted/40 text-center">
          <div className="text-xs text-muted-foreground mb-1">Entry</div>
          <div className="text-xs font-mono font-semibold text-foreground">
            ${position.entry_price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-muted/40 text-center">
          <div className="text-xs text-muted-foreground mb-1">Current</div>
          <div className={`text-xs font-mono font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            ${position.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-red-500/10 text-center">
          <div className="text-xs text-red-400/70 mb-1 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> SL
          </div>
          <div className="text-xs font-mono font-semibold text-red-400">
            ${position.stop_loss?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-green-500/10 text-center">
          <div className="text-xs text-green-400/70 mb-1 flex items-center justify-center gap-1">
            <Target className="w-3 h-3" /> TP1
          </div>
          <div className="text-xs font-mono font-semibold text-green-400">
            ${position.take_profit_1?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Status badges */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        {position.trailing_stop_active && (
          <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">Trailing Stop</span>
        )}
        {position.break_even_active && (
          <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">Break Even</span>
        )}
        {position.tp1_hit && (
          <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400 border border-green-500/20">TP1 Hit ✓</span>
        )}
        {position.tp2_hit && (
          <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400 border border-green-500/20">TP2 Hit ✓</span>
        )}
        <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground border border-border">
          Risk: {position.risk_pct?.toFixed(1)}%
        </span>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-8 gap-1"
          onClick={() => onPartialClose?.(position)}>
          <Minimize2 className="w-3 h-3" /> Partial Close
        </Button>
        <Button variant="destructive" size="sm" className="flex-1 text-xs h-8 bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25"
          onClick={() => onClose?.(position)}>
          Close Position
        </Button>
      </div>
    </div>
  );
}