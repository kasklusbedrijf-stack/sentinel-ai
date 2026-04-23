import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, TrendingUp, Shield, BarChart2, Bell, Send, Plus, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

const AGENTS = [
  {
    name: 'market_watcher',
    label: 'Market Watcher',
    icon: TrendingUp,
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    description: 'Monitors prices, trends, volume, and technical indicators. Ask about market conditions, gainers, losers.',
    examples: ['What are the top gainers today?', 'Analyze BTC technical setup', 'What is the current market sentiment?'],
  },
  {
    name: 'risk_manager',
    label: 'Risk Manager',
    icon: Shield,
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    description: 'Evaluates portfolio risk, checks position safety, enforces rules. Capital protection is the priority.',
    examples: ['Is my portfolio over-exposed?', 'Check current risk levels', 'Should I activate emergency stop?'],
  },
  {
    name: 'trade_planner',
    label: 'Trade Planner',
    icon: BarChart2,
    color: 'text-green-400 bg-green-400/10 border-green-400/20',
    description: 'Plans trades with entry, SL, TPs, and position sizing. Uses the AI scoring engine. Never executes without your approval.',
    examples: ['Plan a BTC trade', 'Analyze ETH setup for entry', 'Generate a signal for SOL'],
  },
  {
    name: 'alert_agent',
    label: 'Alert Agent',
    icon: Bell,
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    description: 'Manages alerts and notifications. Can create, review, and send alerts for price moves or risk events.',
    examples: ['Set a BTC price alert at $70k', 'Show my recent alerts', 'Create a risk alert for ETH'],
  },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversations, setConversations] = useState({});
  const [activeConvId, setActiveConvId] = useState({});
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const agent = AGENTS.find(a => a.name === selectedAgent);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedAgent]);

  const startNewConversation = async (agentName) => {
    const conv = await base44.agents.createConversation({
      agent_name: agentName,
      metadata: { name: `${agentName} - ${new Date().toLocaleString()}` },
    });
    setConversations(prev => ({ ...prev, [agentName]: [...(prev[agentName] || []), conv] }));
    setActiveConvId(prev => ({ ...prev, [agentName]: conv.id }));
    setMessages(prev => ({ ...prev, [`${agentName}:${conv.id}`]: conv.messages || [] }));
    setSelectedAgent(agentName);

    const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(prev => ({ ...prev, [`${agentName}:${conv.id}`]: data.messages || [] }));
    });

    return () => unsub();
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent || sending) return;
    const agentName = selectedAgent;
    let convId = activeConvId[agentName];

    if (!convId) {
      await startNewConversation(agentName);
      return;
    }

    const conv = { id: convId };
    setSending(true);
    const text = input.trim();
    setInput('');

    // Optimistic update
    setMessages(prev => {
      const key = `${agentName}:${convId}`;
      return { ...prev, [key]: [...(prev[key] || []), { role: 'user', content: text }] };
    });

    await base44.agents.addMessage(conv, { role: 'user', content: text });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const currentMessages = selectedAgent && activeConvId[selectedAgent]
    ? messages[`${selectedAgent}:${activeConvId[selectedAgent]}`] || []
    : [];

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Sidebar: agent list — hidden on mobile when chat is open */}
      <div className={cn(
        "border-r border-border bg-card/50 flex flex-col flex-shrink-0 transition-all",
        "w-full sm:w-64",
        selectedAgent ? "hidden sm:flex" : "flex"
      )}>
        <div className="px-4 py-4 border-b border-border">
          <h2 className="font-bold text-base flex items-center gap-2"><Bot className="w-4 h-4 text-primary" /> AI Agents</h2>
          <p className="text-xs text-muted-foreground mt-1">Chat with specialized agents</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {AGENTS.map(ag => {
            const Icon = ag.icon;
            const isActive = selectedAgent === ag.name;
            return (
              <button
                key={ag.name}
                onClick={() => {
                  if (!activeConvId[ag.name]) startNewConversation(ag.name);
                  else setSelectedAgent(ag.name);
                }}
                className={cn("w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-colors",
                  isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50 border border-transparent')}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0", ag.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight">{ag.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{ag.description.split('.')[0]}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main chat area */}
      <div className={cn("flex-1 flex flex-col min-w-0", !selectedAgent && "hidden sm:flex")}>
        {!selectedAgent ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-lg">
              <Bot className="w-14 h-14 text-primary/40 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Choose an AI Agent</h2>
              <p className="text-muted-foreground text-sm mb-6">Each agent specializes in a different aspect of crypto trading.</p>
              <div className="grid grid-cols-2 gap-3">
                {AGENTS.map(ag => {
                  const Icon = ag.icon;
                  return (
                    <button
                      key={ag.name}
                      onClick={() => startNewConversation(ag.name)}
                      className={cn("p-4 rounded-xl border-2 text-left hover:scale-[1.02] transition-all", ag.color)}
                    >
                      <Icon className="w-5 h-5 mb-2" />
                      <div className="font-semibold text-sm">{ag.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 leading-relaxed hidden sm:block">{ag.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Agent header */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-card/50 flex items-center gap-2 flex-shrink-0">
              {/* Back button on mobile */}
              <button
                onClick={() => setSelectedAgent(null)}
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary/50 text-muted-foreground flex-shrink-0 -ml-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              {(() => { const ag = AGENTS.find(a => a.name === selectedAgent); const Icon = ag?.icon; return Icon ? <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0", ag.color)}><Icon className="w-4 h-4" /></div> : null; })()}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight">{agent?.label}</div>
                <div className="text-xs text-muted-foreground truncate hidden sm:block">{agent?.description}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => startNewConversation(selectedAgent)} className="gap-1.5 flex-shrink-0 text-xs h-8 px-2.5">
                <Plus className="w-3 h-3" /> New
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
              {currentMessages.length === 0 && (
                <div className="flex flex-col items-center pt-10 pb-4 px-2 text-center">
                  <p className="text-muted-foreground text-sm mb-5">Start a conversation with {agent?.label}</p>
                  <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 w-full max-w-sm sm:max-w-none">
                    {agent?.examples.map(ex => (
                      <button
                        key={ex}
                        onClick={() => setInput(ex)}
                        className="px-4 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5 transition-all text-left leading-snug w-full sm:w-auto"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentMessages.map((msg, i) => (
                <div key={i} className={cn("flex gap-2.5 sm:gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role !== 'user' && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[88%] sm:max-w-[80%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm min-w-0",
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
                  )}>
                    {msg.role === 'user' ? (
                      <p className="leading-relaxed break-words">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 break-words"
                        components={{
                          code: ({ inline, children }) => inline
                            ? <code className="px-1 py-0.5 rounded bg-secondary text-xs font-mono break-all">{children}</code>
                            : <pre className="bg-secondary rounded-lg p-3 overflow-x-auto my-2 text-xs"><code className="font-mono whitespace-pre-wrap">{children}</code></pre>,
                          p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="my-1 ml-4 list-decimal space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    {/* Tool calls */}
                    {msg.tool_calls?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.tool_calls.map((tc, ti) => (
                          <div key={ti} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 min-w-0">
                            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", tc.status === 'completed' ? 'bg-green-400' : tc.status === 'running' ? 'bg-yellow-400 animate-pulse' : 'bg-muted-foreground')} />
                            <span className="font-mono truncate">{tc.name || 'tool'}</span>
                            <span className="text-muted-foreground flex-shrink-0">{tc.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-2.5 sm:gap-3 justify-start">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl px-4 py-2.5 sm:py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 sm:px-4 pt-3 pb-4 sm:py-4 border-t border-border bg-card/30" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <div className="flex gap-2 items-center">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${agent?.label}…`}
                  className="flex-1 bg-secondary border-border text-sm h-10"
                  disabled={sending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  size="icon"
                  className="flex-shrink-0 w-10 h-10"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}