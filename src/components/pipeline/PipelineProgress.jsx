import { useEffect, useState } from 'react';
import { Loader2, Eye, BarChart2, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 'market_scan',
    label: 'Market Watcher',
    sublabel: 'Scanning assets & identifying setups…',
    icon: Eye,
    color: 'text-blue-400',
    border: 'border-blue-400/30',
    bg: 'bg-blue-400/10',
  },
  {
    id: 'trade_planning',
    label: 'Trade Planner',
    sublabel: 'Building structured trade plans…',
    icon: BarChart2,
    color: 'text-green-400',
    border: 'border-green-400/30',
    bg: 'bg-green-400/10',
  },
  {
    id: 'risk_review',
    label: 'Risk Manager',
    sublabel: 'Reviewing plans against risk rules…',
    icon: Shield,
    color: 'text-yellow-400',
    border: 'border-yellow-400/30',
    bg: 'bg-yellow-400/10',
  },
  {
    id: 'done',
    label: 'Complete',
    sublabel: 'Pipeline finished',
    icon: CheckCircle2,
    color: 'text-primary',
    border: 'border-primary/30',
    bg: 'bg-primary/10',
  },
];

const STEP_ORDER = ['market_scan', 'trade_planning', 'risk_review', 'done'];

function stepIndex(stepId) {
  return STEP_ORDER.indexOf(stepId);
}

// Rotating status messages per step
const MESSAGES = {
  market_scan: [
    'Analyzing technical indicators…',
    'Checking RSI and MACD signals…',
    'Scanning trend strength across assets…',
    'Identifying top setups by quality score…',
  ],
  trade_planning: [
    'Calculating entry levels…',
    'Setting stop-loss based on structure…',
    'Defining take-profit targets…',
    'Sizing positions within risk limits…',
  ],
  risk_review: [
    'Checking confidence thresholds…',
    'Verifying R:R ratios…',
    'Applying exposure limits…',
    'Filtering by safety rules…',
  ],
};

export default function PipelineProgress({ currentStep }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => i + 1), 2800);
    return () => clearInterval(t);
  }, [currentStep]);

  const activeIdx = stepIndex(currentStep || 'market_scan');
  const msgs = MESSAGES[currentStep] || MESSAGES.market_scan;
  const currentMsg = msgs[msgIdx % msgs.length];

  return (
    <div className="space-y-4">
      {/* Main status card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">AI Scout is running</div>
          <div className="text-xs text-muted-foreground mt-1 h-4 transition-all">{currentMsg}</div>
        </div>
        <div className="text-xs text-muted-foreground">This takes 30–90 seconds. Stay on this page.</div>
      </div>

      {/* Step timeline */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const isDone = i < activeIdx;
          const isActive = i === activeIdx;
          const isPending = i > activeIdx;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border transition-all',
                isDone ? 'bg-card border-border opacity-60' : '',
                isActive ? `${step.bg} ${step.border}` : '',
                isPending ? 'bg-card border-border opacity-30' : '',
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0',
                isDone ? 'bg-primary/10 border-primary/20' : '',
                isActive ? `${step.bg} ${step.border}` : '',
                isPending ? 'bg-muted border-border' : '',
              )}>
                {isDone
                  ? <CheckCircle2 className="w-4 h-4 text-primary" />
                  : isActive
                  ? <Loader2 className={cn('w-4 h-4 animate-spin', step.color)} />
                  : <step.icon className="w-4 h-4 text-muted-foreground/40" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-semibold', isDone ? 'text-foreground' : isActive ? step.color : 'text-muted-foreground/40')}>
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {isDone ? 'Completed' : isActive ? step.sublabel : 'Waiting…'}
                </div>
              </div>
              {isDone && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
              {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}