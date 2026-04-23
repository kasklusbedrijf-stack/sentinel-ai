import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Loader2, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AgentChat({ agentName, agentLabel, agentDescription, colorClass = 'text-primary' }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, [agentName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeConversation) return;
    const unsub = base44.agents.subscribeToConversation(activeConversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [activeConversation?.id]);

  async function loadConversations() {
    setLoading(true);
    try {
      const convs = await base44.agents.listConversations({ agent_name: agentName });
      setConversations(convs || []);
      if (convs?.length > 0) {
        const latest = convs[0];
        setActiveConversation(latest);
        setMessages(latest.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function newConversation() {
    const conv = await base44.agents.createConversation({
      agent_name: agentName,
      metadata: { name: `${agentLabel} — ${new Date().toLocaleDateString()}` }
    });
    setActiveConversation(conv);
    setMessages([]);
    setConversations(prev => [conv, ...prev]);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    let conv = activeConversation;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: agentName,
        metadata: { name: `${agentLabel} — ${new Date().toLocaleDateString()}` }
      });
      setActiveConversation(conv);
      setConversations(prev => [conv, ...prev]);
    }

    setMessages(prev => [...prev, { role: 'user', content: text, id: Date.now() }]);

    try {
      await base44.agents.addMessage(conv, { role: 'user', content: text });
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Conversation list */}
      <div className="hidden md:flex flex-col w-48 flex-shrink-0 gap-2">
        <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={newConversation}>
          <Plus className="w-3 h-3" /> New Chat
        </Button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => { setActiveConversation(conv); setMessages(conv.messages || []); }}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg truncate transition-colors
                ${activeConversation?.id === conv.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              {conv.metadata?.name || 'Chat'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className={`w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3`}>
                <Bot className={`w-6 h-6 ${colorClass}`} />
              </div>
              <p className="text-sm font-medium text-foreground">{agentLabel}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-48">{agentDescription}</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className={`w-4 h-4 ${colorClass}`} />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm
                  ${msg.role === 'user'
                    ? 'bg-primary/10 text-foreground border border-primary/20'
                    : 'bg-card border border-border text-foreground'
                  }`}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className={`w-4 h-4 ${colorClass}`} />
              </div>
              <div className="bg-card border border-border rounded-xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-end gap-2 bg-card border border-border rounded-xl px-3 py-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask ${agentLabel}...`}
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground resize-none outline-none placeholder:text-muted-foreground max-h-32 min-h-[1.5rem]"
              style={{ height: 'auto' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
            />
          </div>
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-10 h-10 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}