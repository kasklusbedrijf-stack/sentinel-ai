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
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-sm flex items-center gap-2"><Bot className="w-4 h-4 text-primary" /> AI Agents</h2>
          <p className="text-xs text-muted-foreground mt-1">Chat with specialized agents</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
                className={cn("w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                  isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50')}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0", ag.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{ag.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{ag.description.split('.')[0]}</div>
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
            <div className="px-4 py-3 border-b border-border bg-card/50 flex items-center justify-between flex-shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Back button on mobile */}
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-secondary/50 text-muted-foreground flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {(() => { const ag = AGENTS.find(a => a.name === selectedAgent); const Icon = ag?.icon; return Icon ? <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0", ag.color)}><Icon className="w-4 h-4" /></div> : null; })()}
                <div className="min-w-0">
                  <div className="font-semibold text-sm">{agent?.label}</div>
                  <div className="text-xs text-muted-foreground truncate hidden sm:block">{agent?.description}</div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => startNewConversation(selectedAgent)} className="gap-1.5 flex-shrink-0 text-xs">
                <Plus className="w-3 h-3" /> New
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {currentMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm mb-4">Start a conversation with {agent?.label}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {agent?.examples.map(ex => (
                      <button key={ex} onClick={() => { setInput(ex); }} className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentMessages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border')}>
                    {msg.role === 'user' ? (
                      <p>{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          code: ({ inline, children }) => inline
                            ? <code className="px-1 py-0.5 rounded bg-secondary text-xs font-mono">{children}</code>
                            : <pre className="bg-secondary rounded-lg p-3 overflow-x-auto my-2"><code className="text-xs font-mono">{children}</code></pre>,
                          p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    {/* Tool calls */}
                    {msg.tool_calls?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.tool_calls.map((tc, ti) => (
                          <div key={ti} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1">
                            <div className={cn("w-1.5 h-1.5 rounded-full", tc.status === 'completed' ? 'bg-green-400' : tc.status === 'running' ? 'bg-yellow-400 animate-pulse' : 'bg-muted-foreground')} />
                            <span className="font-mono">{tc.name || 'tool'}</span>
                            <span className="text-muted-foreground">{tc.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${agent?.label}…`}
                  className="flex-1 bg-secondary border-border text-sm"
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={!input.trim() || sending} size="icon" className="flex-shrink-0">
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