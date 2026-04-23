import { cn } from '@/lib/utils';

const configs = {
  BUY:          { label: 'BUY',          cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
  PARTIAL_BUY:  { label: 'PARTIAL BUY',  cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  HOLD:         { label: 'HOLD',         cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  WAIT:         { label: 'WAIT',         cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  PARTIAL_SELL: { label: 'PARTIAL SELL', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  SELL:         { label: 'SELL',         cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function SignalBadge({ type, className }) {
  const cfg = configs[type] || configs.WAIT;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', cfg.cls, className)}>
      {cfg.label}
    </span>
  );
}