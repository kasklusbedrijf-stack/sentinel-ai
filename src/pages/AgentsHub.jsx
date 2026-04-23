import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, TrendingUp, Shield, Zap, Bell, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const AGENTS = [
  {
    id: 'market_watcher',
    name: 'Market Watcher',
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    desc: 'Monitors prices, trends, volatility, and market conditions.',
    hints: ['Analyze BTC market conditions', 'What are the top movers today?', 'Update ETH technical data', 'Check market sentiment'],
  },
  {
    id: 'risk_manager',
    name: 'Risk Manager',
    icon: Shield,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    desc: 'Enforces safety rules, monitors portfolio risk, and protects capital.',
    hints: ['Check my portfolio risk', 'Is my current exposure safe?', 'Activate emergency stop', 'Review my risk settings'],
  },
  {
    id: 'trade_planner',
    name: 'Trade Planner',
    icon: Zap,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    desc: 'Generates rule-based trade plans with entry, SL, and TP levels.',
    hints: ['Analyze BTC for a trade', 'Create a trade plan for ETH', 'What is the R:R for SOL at $120?', 'Is there a clean setup on BNB?'],
  },
  {
    id: 'alert_agent',
    name: 'Alert Agent',
    icon: Bell,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    desc: 'Manages alerts, notifications, and platform-wide events.',
    hints: ['Show my unread alerts', 'Create a price alert for BTC at $50k', 'Summarize critical alerts', 'Clear all read alerts'],
  },
];

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground border border-border')}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {message.content}
          </ReactMarkdown>
        )}
        {message.tool_calls?.map((tc, i) => (
          <div key={i} className="mt-2 text-xs bg-black/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">{tc.name?.split('.').reverse()[0]?.toLowerCase()}</span>
            <span className={cn('ml-auto', tc.status === 'completed' ? 'text-success' : 'text-muted-foreground')}>
              {tc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentsHub() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversations, setConversations] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const currentConvId = conversations[selectedAgent?.id];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedAgent) return;
    if (currentConvId) {
      loadConversation(currentConvId);
    } else {
      setMessages([]);
    }
  }, [selectedAgent]);

  const loadConversation = async (convId) => {
    const conv = await base44.agents.getConversation(convId);
    setMessages(conv.messages || []);
  };

  useEffect(() => {
    if (!selectedAgent) return;
    let unsubscribe;
    if (currentConvId) {
      unsubscribe = base44.agents.subscribeToConversation(currentConvId, (data) => {
        setMessages(data.messages || []);
        setLoading(false);
      });
    }
    return () => unsubscribe?.();
  }, [currentConvId]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent || loading) return;
    setLoading(true);
    const text = input;
    setInput('');

    let convId = currentConvId;
    let conv;

    if (!convId) {
      conv = await base44.agents.createConversation({
        agent_name: selectedAgent.id,
        metadata: { name: `${selectedAgent.name} session` },
      });
      convId = conv.id;
      setConversations((prev) => ({ ...prev, [selectedAgent.id]: convId }));

      const unsubscribe = base44.agents.subscribeToConversation(convId, (data) => {
        setMessages(data.messages || []);
        setLoading(false);
      });
    }

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    await base44.agents.addMessage({ id: convId }, { role: 'user', content: text });
  };

  const newConversation = () => {
    if (!selectedAgent) return;
    setConversations((prev) => ({ ...prev, [selectedAgent.id]: null }));
    setMessages([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Agent Selector */}
      <div className="w-72 flex-shrink-0 space-y-3">
        <h1 className="text-xl font-bold text-foreground">AI Agents</h1>
        <p className="text-xs text-muted-foreground">Specialized AI agents that read and update your platform data in real time.</p>
        <div className="space-y-2 mt-2">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <button key={agent.id} onClick={() => setSelectedAgent(agent)}
                className={cn('w-full text-left p-4 rounded-xl border transition-all',
                  isSelected ? `${agent.bg} ${agent.border} border` : 'bg-card border-border hover:bg-secondary/50')}>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', agent.bg)}>
                    <Icon className={cn('w-4 h-4', agent.color)} />
                  </div>
                  <span className="font-semibold text-sm text-foreground">{agent.name}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{agent.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        {!selectedAgent ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Select an AI Agent</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-sm">
              Choose an agent from the left. Each agent has access to your platform data and can read, analyze, and update it in real time.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', selectedAgent.bg)}>
                  {(() => { const Icon = selectedAgent.icon; return <Icon className={cn('w-5 h-5', selectedAgent.color)} />; })()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedAgent.name}</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full" /> Active
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={newConversation} className="gap-1 text-xs">
                <Plus className="w-3 h-3" /> New Chat
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground text-center">Start a conversation or try one of these:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAgent.hints.map((hint) => (
                      <button key={hint} onClick={() => setInput(hint)}
                        className="text-left p-3 bg-secondary/50 hover:bg-secondary rounded-lg text-xs text-foreground border border-border transition-colors">
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <div className="bg-secondary rounded-2xl px-4 py-2.5 border border-border">
                    <div className="flex gap-1.5 items-center h-5">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border flex-shrink-0">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${selectedAgent.name}...`}
                  rows={1}
                  className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                <Button onClick={sendMessage} disabled={!input.trim() || loading} size="icon" className="rounded-xl h-10 w-10">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}