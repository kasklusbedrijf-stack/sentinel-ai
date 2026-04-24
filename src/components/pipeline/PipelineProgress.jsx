import { useEffect, useState } from 'react';
import { Loader2, Eye, BarChart2, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppPreferences } from '@/lib/AppPreferencesContext';

const STEP_ORDER = ['market_scan', 'trade_planning', 'risk_review', 'done'];

function stepIndex(stepId) {
  return STEP_ORDER.indexOf(stepId);
}

export default function PipelineProgress({ currentStep }) {
  const { t } = useAppPreferences();
  const [msgIdx, setMsgIdx] = useState(0);

  const STEPS = [
    { id: 'market_scan',   label: t('pipeline_scan_label'), sublabel: t('pipeline_scan_sublabel'), icon: Eye,          color: 'text-blue-400',   border: 'border-blue-400/30',   bg: 'bg-blue-400/10' },
    { id: 'trade_planning',label: t('pipeline_plan_label'), sublabel: t('pipeline_plan_sublabel'), icon: BarChart2,     color: 'text-green-400',  border: 'border-green-400/30',  bg: 'bg-green-400/10' },
    { id: 'risk_review',   label: t('pipeline_risk_label'), sublabel: t('pipeline_risk_sublabel'), icon: Shield,        color: 'text-yellow-400', border: 'border-yellow-400/30', bg: 'bg-yellow-400/10' },
    { id: 'done',          label: t('pipeline_done_label'), sublabel: t('pipeline_done_sublabel'), icon: CheckCircle2,  color: 'text-primary',    border: 'border-primary/30',    bg: 'bg-primary/10' },
  ];

  const MESSAGES = {
    market_scan:    [t('pipeline_msg_scan_1'), t('pipeline_msg_scan_2'), t('pipeline_msg_scan_3'), t('pipeline_msg_scan_4')],
    trade_planning: [t('pipeline_msg_plan_1'), t('pipeline_msg_plan_2'), t('pipeline_msg_plan_3'), t('pipeline_msg_plan_4')],
    risk_review:    [t('pipeline_msg_risk_1'), t('pipeline_msg_risk_2'), t('pipeline_msg_risk_3'), t('pipeline_msg_risk_4')],
  };

  useEffect(() => {
    const timer = setInterval(() => setMsgIdx(i => i + 1), 2800);
    return () => clearInterval(timer);
  }, [currentStep]);

  const activeIdx = stepIndex(currentStep || 'market_scan');
  const msgs = MESSAGES[currentStep] || MESSAGES.market_scan;
  const currentMsg = msgs[msgIdx % msgs.length];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{t('pipeline_running')}</div>
          <div className="text-xs text-muted-foreground mt-1 h-4 transition-all">{currentMsg}</div>
        </div>
        <div className="text-xs text-muted-foreground">{t('pipeline_stay_on_page')}</div>
      </div>

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
                  {isDone ? t('pipeline_step_done') : isActive ? step.sublabel : t('pipeline_step_waiting')}
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