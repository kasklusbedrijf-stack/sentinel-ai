import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Plus, Trash2, Eye, Shield, TrendingUp, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AgentChatMessage from '../components/agents/AgentChatMessage';

const agents = [
  { name: 'market_watcher', label: 'Market Watcher', icon: Eye, color: 'text-cyan-400', description: 'Monitors prices, trends, and market data' },
  { name: 'risk_manager', label: 'Risk Manager', icon: Shield, color: 'text-yellow-400', description: 'Evaluates risk, enforces safety rules' },
  { name: 'trade_planner', label: 'Trade Planner', icon: TrendingUp, color: 'text-green-400', description: 'Generates signals and trade plans' },
  { name: 'alert_agent', label: 'Alert Agent', icon: Bell, color: 'text-purple-400', description: 'Monitors positions, sends alerts' },
];

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, [selectedAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeConversation) return;
    const unsubscribe = base44.agents.subscribeToConversation(activeConversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [activeConversation?.id]);

  const loadConversations = async () => {
    const convs = await base44.agents.listConversations({ agent_name: selectedAgent.name });
    setConversations(convs || []);
    if (convs?.length > 0) {
      const full = await base44.agents.getConversation(convs[0].id);
      setActiveConversation(full);
      setMessages(full.messages || []);
    } else {
      setActiveConversation(null);
      setMessages([]);
    }
  };

  const createNewConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: selectedAgent.name,
      metadata: { name: `${selectedAgent.label} - ${new Date().toLocaleDateString()}` },
    });
    setActiveConversation(conv);
    setMessages([]);
    setConversations(prev => [conv, ...prev]);
  };

  const selectConversation = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setActiveConversation(full);
    setMessages(full.messages || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    if (!activeConversation) {
      await createNewConversation();
    }

    setSending(true);
    const msg = input.trim();
    setInput('');

    const convToUse = activeConversation || (await base44.agents.createConversation({
      agent_name: selectedAgent.name,
      metadata: { name: `${selectedAgent.label} - ${new Date().toLocaleDateString()}` },
    }));

    if (!activeConversation) {
      setActiveConversation(convToUse);
      setConversations(prev => [convToUse, ...prev]);
    }

    await base44.agents.addMessage(convToUse, { role: 'user', content: msg });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Agent Selection & Conversations */}
      <div className="w-72 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" /> AI Agents
          </h2>
        </div>

        {/* Agent Tabs */}
        <div className="p-3 space-y-1 border-b border-border">
          {agents.map(agent => {
            const IconComp = agent.icon;
            return (
              <button
                key={agent.name}
                onClick={() => setSelectedAgent(agent)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                  selectedAgent.name === agent.name
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <IconComp className={cn("w-4 h-4 shrink-0", selectedAgent.name === agent.name ? 'text-primary' : agent.color)} />
                <div className="min-w-0">
                  <p className="font-medium truncate">{agent.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{agent.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <Button variant="outline" size="sm" onClick={createNewConversation} className="w-full text-xs mb-2">
            <Plus className="w-3 h-3 mr-1.5" /> New Chat
          </Button>
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-xs transition-all truncate",
                activeConversation?.id === conv.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {conv.metadata?.name || 'Untitled'}
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {React.createElement(selectedAgent.icon, { className: cn("w-4 h-4", selectedAgent.color) })}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{selectedAgent.label}</h3>
              <p className="text-xs text-muted-foreground">{selectedAgent.description}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                {React.createElement(selectedAgent.icon, { className: cn("w-8 h-8", selectedAgent.color) })}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{selectedAgent.label}</h3>
              <p className="text-sm text-muted-foreground max-w-md">{selectedAgent.description}</p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md">
                {selectedAgent.name === 'market_watcher' && ['Show me BTC analysis', 'What are the top gainers?', 'Update market data'].map(s => (
                  <button key={s} onClick={() => { setInput(s); }} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all">{s}</button>
                ))}
                {selectedAgent.name === 'risk_manager' && ['Check my portfolio risk', 'Review risk settings', 'Is my BTC position safe?'].map(s => (
                  <button key={s} onClick={() => { setInput(s); }} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all">{s}</button>
                ))}
                {selectedAgent.name === 'trade_planner' && ['Generate signal for ETH', 'Create a trade plan for SOL', 'What setups look good?'].map(s => (
                  <button key={s} onClick={() => { setInput(s); }} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all">{s}</button>
                ))}
                {selectedAgent.name === 'alert_agent' && ['Check my stop losses', 'Any alerts?', 'Monitor BTC volatility'].map(s => (
                  <button key={s} onClick={() => { setInput(s); }} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all">{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <AgentChatMessage key={idx} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${selectedAgent.label}...`}
              className="bg-background border-border"
              disabled={sending}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || sending} size="icon" className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}