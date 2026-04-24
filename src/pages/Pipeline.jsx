import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PipelineProgress from '@/components/pipeline/PipelineProgress';
import PipelineResults from '@/components/pipeline/PipelineResults';
import PipelineHistory from '@/components/pipeline/PipelineHistory';
import { Cpu, History, ChevronLeft } from 'lucide-react';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { cn } from '@/lib/utils';

const STEPS = ['market_scan', 'trade_planning', 'risk_review', 'done'];

export default function Pipeline() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();
  const [phase, setPhase] = useState('idle'); // idle | running | completed | failed
  const [activePipelineId, setActivePipelineId] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const pollRef = useRef(null);

  // Poll pipeline status while running
  useEffect(() => {
    if (phase !== 'running' || !activePipelineId) return;

    pollRef.current = setInterval(async () => {
      const records = await base44.entities.AgentPipeline.filter({ id: activePipelineId });
      const rec = records[0];
      if (!rec) return;
      setCurrentStep(rec.step);
      if (rec.status === 'completed') {
        clearInterval(pollRef.current);
        setPipelineData(rec);
        setPhase('completed');
      } else if (rec.status === 'failed') {
        clearInterval(pollRef.current);
        setPipelineData(rec);
        setPhase('failed');
      }
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [phase, activePipelineId]);

  const handleStart = async () => {
    setPhase('running');
    setCurrentStep('market_scan');
    setPipelineData(null);
    setShowHistory(false);
    try {
      const res = await base44.functions.invoke('runAgentPipeline', {});
      if (res.data?.success) {
        // Pipeline completed synchronously (function returned full result)
        // Find the pipeline record
        const records = await base44.entities.AgentPipeline.filter({ id: res.data.pipeline_id });
        setPipelineData(records[0] || null);
        setActivePipelineId(res.data.pipeline_id);
        setCurrentStep('done');
        setPhase('completed');
      } else {
        setPhase('failed');
      }
    } catch (err) {
      setPhase('failed');
    }
  };

  const handleReset = () => {
    setPhase('idle');
    setActivePipelineId(null);
    setPipelineData(null);
    setCurrentStep(null);
  };

  const handleLoadHistorical = (rec) => {
    setPipelineData(rec);
    setCurrentStep('done');
    setPhase('completed');
    setShowHistory(false);
  };

  if (showHistory) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-secondary rounded-lg text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Pipeline History</h1>
        </div>
        <PipelineHistory onSelect={handleLoadHistorical} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">AI Scout</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">3-agent automated market review · No auto-execution</p>
          </div>
        </div>
        {phase === 'idle' && (
          <button onClick={() => setShowHistory(true)} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <History className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* IDLE: trigger screen */}
      {phase === 'idle' && (
        <div className="space-y-4">
          {/* How it works */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">How AI Scout Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { step: '1', agent: 'Market Watcher', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', desc: 'Scans all tracked assets, identifies the best 3–5 trade setups based on technical indicators, trend, and momentum.' },
                { step: '2', agent: 'Trade Planner', color: 'text-green-400 bg-green-400/10 border-green-400/20', desc: 'Takes each setup and builds a full trade plan: entry, stop loss, TP1/2/3, position size, confidence score.' },
                { step: '3', agent: 'Risk Manager', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', desc: 'Reviews every plan against your risk rules. Approves or blocks each one with a clear explanation.' },
              ].map(({ step, agent, color, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5', color)}>
                    {step}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{agent}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Safety notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 animate-pulse" />
            <div>
              <div className="text-sm font-semibold text-foreground">Safe by design</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                AI Scout never executes trades automatically. Approved plans are placed in your Trade Approval queue — you review and confirm each one manually.
              </div>
            </div>
          </div>

          {/* Trigger button */}
          <Button
            onClick={handleStart}
            size="lg"
            className="w-full h-14 text-base font-semibold gap-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
          >
            <Cpu className="w-5 h-5" />
            Run AI Scout
          </Button>
        </div>
      )}

      {/* RUNNING: progress screen */}
      {phase === 'running' && (
        <PipelineProgress currentStep={currentStep} />
      )}

      {/* COMPLETED: results screen */}
      {phase === 'completed' && pipelineData && (
        <PipelineResults
          pipelineData={pipelineData}
          onReset={handleReset}
          onViewApprovals={() => navigate('/trade-approval')}
        />
      )}

      {/* FAILED */}
      {phase === 'failed' && (
        <Card className="bg-destructive/5 border-destructive/30">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-destructive font-semibold">Pipeline failed</div>
            <div className="text-sm text-muted-foreground">{pipelineData?.error_message || 'An unexpected error occurred. Check your API configuration.'}</div>
            <Button variant="outline" onClick={handleReset} className="w-full">Try Again</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}