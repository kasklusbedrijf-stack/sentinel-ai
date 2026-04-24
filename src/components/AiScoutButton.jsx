import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AiScoutButton({ className }) {
  return (
    <Link to="/pipeline">
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-xl border border-primary/25 bg-primary/5 cursor-pointer',
        'hover:bg-primary/10 hover:border-primary/40 transition-all group',
        className
      )}>
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <Cpu className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">AI Scout</div>
          <div className="text-xs text-muted-foreground">Multi-agent scan → plan → risk review</div>
        </div>
        <div className="flex-shrink-0 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
          Run
        </div>
      </div>
    </Link>
  );
}