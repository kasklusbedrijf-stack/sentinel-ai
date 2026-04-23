import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, TrendingUp, Shield, BarChart2, Bell, Send, Plus, ChevronRight, Loader2, ImagePlus, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    chartPrompt: `You are Market Watcher, a premium crypto market intelligence analyst inside a top-tier mobile trading app.

YOUR ROLE:
Analyze only what is clearly visible in the attached chart screenshot. Separate facts from interpretation. Use evidence, never invent data.

CRITICAL RULES — follow without exception:
- Analyze ONLY visible candles, wicks, price zones, trend direction, volatility clues, and momentum behavior.
- Never invent support/resistance levels, volume, order flow, indicators, or timeframes that are not readable.
- If the screenshot is incomplete, blurry, zoomed poorly, missing candles, or low quality, state exactly what is missing.
- Separate facts ("visible on the chart") from interpretation ("what it may mean").
- If the setup looks clean, messy, overextended, weak, or indecisive, mention it directly.
- Never mention backend tools, internal functions, JSON, or system architecture.

RESPONSE FORMAT — follow exactly:

**1. Visible on Screenshot**
- Asset/pair [if readable]
- Timeframe [if visible; if not, say "Not visible"]
- Candle structure [e.g., "5 red candles with long wicks", "2 large green candles", "tight compression"]
- Price action clues [e.g., "higher lows", "lower highs", "flat range", "breakdown"]
- Any visible zones or levels [only if clearly marked or obvious from price action]

**2. Market Structure**
[2–3 sentences max on what the pattern suggests: trend direction, momentum, recent behavior]

**3. Momentum & Volatility**
- Trend: [up / down / sideways / unclear]
- Volatility: [expanding / contracting / stable]
- Wick behavior: [rejection wicks / full candle closes / balanced / extreme]

**4. Key Zones**
- Nearest support: [price level if visible, or "Not readable"]
- Nearest resistance: [price level if visible, or "Not readable"]
- Recent high/low: [if clearly visible]

**5. Bias & Setup Quality**
- Bias: [Bullish / Bearish / Neutral / Unclear]
- Setup: [Clean / Mixed / Messy / Overextended / Indecisive]

**6. Cannot Confirm**
[List what is missing: volume, specific indicators, wider context, order book, real-time data, exact timeframe, etc.]

**7. Confidence Score**
[1–10, based on screenshot quality and visible structure clarity]

**FINAL VERDICT** [2–4 lines]
[Summary: what the visible structure suggests, what traders should watch, what data is needed for higher conviction]

Never exceed this format. Never add filler. Never explain the backend. Premium, concise, mobile-first.`,
  },
  {
    name: 'risk_manager',
    label: 'Risk Manager',
    icon: Shield,
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    description: 'Evaluates portfolio risk, checks position safety, enforces rules. Capital protection is the priority.',
    examples: ['Is my portfolio over-exposed?', 'Check current risk levels', 'Should I activate emergency stop?'],
    chartPrompt: 'You are Risk Manager. Analyze only what is visible in this chart screenshot from a capital protection perspective. Describe: 1) What is visible on the chart 2) Market structure and volatility clues 3) Whether the setup looks high-risk or manageable 4) Visible stop-loss placement ideas based on structure 5) Risk notes and warnings 6) Confidence score. State clearly what cannot be confirmed from the screenshot alone. Never invent data.',
  },
  {
    name: 'trade_planner',
    label: 'Trade Planner',
    icon: BarChart2,
    color: 'text-green-400 bg-green-400/10 border-green-400/20',
    description: 'Plans trades with entry, SL, TPs, and position sizing. Uses the AI scoring engine. Never executes without your approval.',
    examples: ['Plan a BTC trade', 'Analyze ETH setup for entry', 'Generate a signal for SOL'],
    chartPrompt: `You are Trade Planner, a senior crypto trade-planning assistant inside a premium mobile trading app.

CRITICAL RULES — follow these without exception:
- Analyze ONLY what is visible in the attached screenshot. Do not invent price levels, indicators, timeframes, or confirmation signals that are not clearly readable.
- Never mention internal tools, function names, data fields, JSON, backend calls, or system architecture. The user never sees the backend.
- Keep your response short, structured, and mobile-readable. No long paragraphs.
- If the screenshot is NOT a single-asset price chart (e.g. it shows a portfolio overview, a news feed, a settings screen, a list of coins, or anything other than an OHLC/candlestick/line chart for one asset), respond with exactly this format:

"This screenshot doesn't show a single-asset price chart, so I can't build a precise trade plan. [One sentence describing what the image actually shows.] Send me a candlestick or line chart for the specific asset and timeframe you want to trade."

- If the screenshot IS a single-asset price chart, respond in this compact format:

**Verdict:** [one line — bullish / bearish / neutral / unclear]
**Visible:** [2–3 bullet points of what is actually readable: candle structure, visible zones, trend, visible indicator if any]
**Possible setup:** [1–2 sentences max — pattern or structure if identifiable]
**Entry idea:** [price zone or condition — only if a clear level is visible, otherwise "Not readable"]
**SL idea:** [level based on visible structure only, or "Not readable"]
**TP ideas:** [TP1 / TP2 if structure supports it, or "Not readable"]
**Risk note:** [one sentence on risk or uncertainty]
**Cannot confirm:** [what is missing — timeframe, volume, indicator values, etc.]

Never exceed this format. Never add extra sections. Never explain the backend.`,
  },
  {
    name: 'alert_agent',
    label: 'Alert Agent',
    icon: Bell,
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    description: 'Manages alerts and notifications. Can create, review, and send alerts for price moves or risk events.',
    examples: ['Set a BTC price alert at $70k', 'Show my recent alerts', 'Create a risk alert for ETH'],
    chartPrompt: 'You are Alert Agent. Analyze only what is visible in this chart screenshot and suggest relevant alerts. Describe: 1) What is visible on the chart 2) Key price levels visible that would make good alert triggers 3) Suggested alert conditions based on visible structure 4) Confidence score. State clearly what cannot be confirmed from the screenshot alone.',
  },
];

// Image lightbox component
function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt="Chart"
        className="max-w-full max-h-full rounded-xl object-contain"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// Pending image attachment preview strip (above input)
function AttachmentPreview({ imageDataUrl, onRemove }) {
  if (!imageDataUrl) return null;
  return (
    <div className="px-3 sm:px-4 pt-2 pb-0">
      <div className="relative inline-block">
        <img
          src={imageDataUrl}
          alt="Attached chart"
          className="h-16 w-auto rounded-lg border border-border object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center shadow-md"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversations, setConversations] = useState({});
  const [activeConvId, setActiveConvId] = useState({});
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingImage, setPendingImage] = useState(null); // base64 data URL
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const agent = AGENTS.find(a => a.name === selectedAgent);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedAgent]);

  // Paste handler for chart screenshots
  useEffect(() => {
    const handlePaste = (e) => {
      if (!selectedAgent) return;
      const items = Array.from(e.clipboardData?.items || []);
      const imageItem = items.find(item => item.type.startsWith('image/'));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) readImageFile(file);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedAgent]);

  const readImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setPendingImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) readImageFile(file);
    e.target.value = '';
  };

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

  const uploadImage = async (dataUrl) => {
    // Convert base64 data URL to File then upload
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'chart.png', { type: blob.type });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  };

  const sendMessage = async () => {
    const hasText = input.trim();
    const hasImage = !!pendingImage;
    if ((!hasText && !hasImage) || !selectedAgent || sending) return;

    const agentName = selectedAgent;
    let convId = activeConvId[agentName];

    if (!convId) {
      await startNewConversation(agentName);
      return;
    }

    const conv = { id: convId };
    setSending(true);
    const text = hasText ? input.trim() : '';
    const imageToSend = pendingImage;
    setInput('');
    setPendingImage(null);

    // Build optimistic message with local preview
    const optimisticMsg = {
      role: 'user',
      content: hasImage
        ? (text || 'Analyze this chart screenshot.')
        : text,
      _localImagePreview: imageToSend, // local only, not persisted
    };

    setMessages(prev => {
      const key = `${agentName}:${convId}`;
      return { ...prev, [key]: [...(prev[key] || []), optimisticMsg] };
    });

    // If image: upload it and send with file_urls + chart-specific system prompt prepended
    if (hasImage) {
      const fileUrl = await uploadImage(imageToSend);
      const ag = AGENTS.find(a => a.name === agentName);
      const chartInstruction = ag?.chartPrompt || '';
      const messageContent = chartInstruction
        ? `${chartInstruction}\n\nUser note: ${text || 'Please analyze this chart screenshot.'}`
        : (text || 'Please analyze this chart screenshot.');

      await base44.agents.addMessage(conv, {
        role: 'user',
        content: messageContent,
        file_urls: [fileUrl],
      });
    } else {
      await base44.agents.addMessage(conv, { role: 'user', content: text });
    }

    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const currentMessages = selectedAgent && activeConvId[selectedAgent]
    ? messages[`${selectedAgent}:${activeConvId[selectedAgent]}`] || []
    : [];

  const canSend = (input.trim() || pendingImage) && !sending;

  return (
    <>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

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
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all border",
                    isActive
                      ? 'bg-primary/10 border-primary/25 shadow-sm'
                      : 'bg-card border-border hover:border-border hover:bg-accent/40'
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0", ag.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-tight text-foreground">{ag.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{ag.description.split('.')[0]}</div>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? 'text-primary' : 'text-muted-foreground/50')} />
                </button>
              );
            })}
          </div>

          {/* Chart analysis hint */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
              <ZoomIn className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                Paste or upload a chart screenshot for AI visual analysis
              </p>
            </div>
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
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary/50 text-muted-foreground flex-shrink-0 -ml-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {(() => { const ag = AGENTS.find(a => a.name === selectedAgent); const Icon = ag?.icon; return Icon ? <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0", ag.color)}><Icon className="w-4 h-4" /></div> : null; })()}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight">{agent?.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{agent?.description.split('.')[0]}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => startNewConversation(selectedAgent)} className="gap-1.5 flex-shrink-0 text-xs h-8 px-2.5">
                  <Plus className="w-3 h-3" /> New
                </Button>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
                {currentMessages.length === 0 && (
                  <div className="flex flex-col items-center pt-10 pb-4 px-2 text-center">
                    <p className="text-muted-foreground text-sm mb-5">Start a conversation with {agent?.label}</p>
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 w-full max-w-sm sm:max-w-none mb-4">
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
                    {/* Chart upload hint in empty state */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary/30 text-xs text-primary/70 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all w-full max-w-sm"
                    >
                      <ImagePlus className="w-4 h-4 flex-shrink-0" />
                      <span>Upload a chart screenshot for visual analysis</span>
                    </button>
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
                      "max-w-[88%] sm:max-w-[80%] rounded-2xl text-sm min-w-0",
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
                    )}>
                      {/* Attached image preview in bubble */}
                      {msg._localImagePreview && (
                        <div className="px-3 pt-3 pb-1">
                          <button
                            onClick={() => setLightboxSrc(msg._localImagePreview)}
                            className="relative group block rounded-lg overflow-hidden"
                          >
                            <img
                              src={msg._localImagePreview}
                              alt="Chart screenshot"
                              className="max-h-48 w-auto rounded-lg object-cover border border-white/10"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        </div>
                      )}
                      <div className="px-3.5 sm:px-4 py-2.5 sm:py-3">
                        {msg.role === 'user' ? (
                          <p className="leading-relaxed break-words text-sm">{msg.content?.replace(/^You are .+?screenshot alone\.\n\nUser note: /s, '')}</p>
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
                              h3: ({ children }) => <h3 className="font-semibold text-sm mt-2 mb-1 text-foreground">{children}</h3>,
                              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
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
                  </div>
                ))}

                {sending && (
                  <div className="flex gap-2.5 sm:gap-3 justify-start">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl px-4 py-2.5 sm:py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Analyzing…</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Pending attachment preview */}
              <AttachmentPreview
                imageDataUrl={pendingImage}
                onRemove={() => setPendingImage(null)}
              />

              {/* Input bar */}
              <div
                className="px-3 sm:px-4 pt-2.5 pb-4 sm:py-4 border-t border-border bg-card/30"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              >
                <div className="flex gap-2 items-center">
                  {/* Image attach button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-10 h-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Attach chart screenshot"
                  >
                    <ImagePlus className="w-4 h-4" />
                  </Button>

                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={pendingImage ? 'Add a note or send image…' : `Ask ${agent?.label}…`}
                    className="flex-1 bg-secondary border-border text-sm h-10"
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!canSend}
                    size="icon"
                    className={cn("flex-shrink-0 w-10 h-10", pendingImage && "bg-blue-500 hover:bg-blue-600")}
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}