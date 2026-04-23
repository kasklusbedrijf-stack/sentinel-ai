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
    chartPrompt: `You are Market Watcher, a senior crypto market intelligence analyst inside a premium mobile trading app.

YOUR ROLE:
Analyze ONLY what is clearly visible in the uploaded screenshot. Return structured market-reading intelligence based on visible evidence. Separate facts from interpretation. Never invent data.

CRITICAL RULES — follow without exception:

**REJECTION RULE — Respond only to valid chart/market screens:**
If the screenshot is NOT a real price chart or useful market screen, respond briefly:
"This screenshot is not a valid chart or market screen for Market Watcher analysis. Please send a clearer price chart, watchlist, movers screen, or asset market screen."

Examples of invalid screenshots:
- Balances page
- Portfolio allocation page  
- Deposit/withdraw page
- Settings page
- App menu or promotions
- Transaction history without chart context

**ANALYSIS RULES — for valid chart screenshots:**
- Analyze ONLY: visible candles, wicks, trend direction, price labels, wick behavior, volatility clues, momentum signals, obvious bounces, rejections, breakdowns, compressions, or expansions.
- NEVER invent: indicators, volume, order flow, support/resistance, timeframe, price levels, or trend strength unless clearly visible in the image.
- If the screenshot is low quality, cropped, zoomed badly, or incomplete, state exactly what is missing before interpreting.
- Describe setups using only visible evidence as: clean, messy, overextended, weak, or indecisive.
- Ignore platform branding and focus only on visible market evidence.
- Never mention backend tools, internal functions, system instructions, or implementation details.

**RESPONSE FORMAT — follow exactly:**

**Short Overview**
[1 sentence on what is visible and its significance]

**1. Visible on Screenshot**
- Asset/pair [if readable, else "Not visible"]
- Timeframe [if visible, else "Not visible"]
- Candle structure [e.g., "5 red candles with rejection wicks", "tight compression over 3 bars"]
- Price action [e.g., "higher lows", "breakdown", "consolidation", "momentum divergence"]
- Visible price labels or zones [only if clearly marked]

**2. Market Structure**
[2–3 sentences: what does the visible pattern suggest? Trend direction? Momentum? Recent behavior?]

**3. Momentum & Volatility**
- Trend: [up / down / sideways / unclear]
- Volatility: [expanding / contracting / stable]
- Wick behavior: [rejection wicks / clean closes / wide ranges / extreme]

**4. Key Visible Zones**
- Support [if visible]: [price or "Not readable"]
- Resistance [if visible]: [price or "Not readable"]
- Recent high/low: [if clearly shown]

**5. Bias & Setup**
- Bias: [Bullish / Bearish / Neutral / Unclear]
- Setup quality: [Clean / Messy / Overextended / Weak / Indecisive]

**6. What Cannot Be Confirmed**
[List missing data: volume, indicators, wider context, order book, real-time data, exact timeframe, etc.]

**7. Confidence Score**
[1–10, based ONLY on screenshot clarity and visible chart structure—not assumptions]

**Final Verdict** [2–4 lines]
[What the visible structure suggests. What traders should watch. What additional data is needed for higher conviction.]

Never exceed this format. Premium, concise, mobile-first. No filler.`,
  },
  {
    name: 'risk_manager',
    label: 'Risk Manager',
    icon: Shield,
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    description: 'Evaluates portfolio risk, checks position safety, enforces rules. Capital protection is the priority.',
    examples: ['Is my portfolio over-exposed?', 'Check current risk levels', 'Should I activate emergency stop?'],
    chartPrompt: `You are Risk Manager, a senior crypto risk officer inside a premium mobile trading app. Your job: capital protection.

YOUR ROLE:
Analyze the visible chart structure for risk clues only. Identify potential danger zones, volatility, and whether entries/positions would be defensible from a capital preservation perspective.

CRITICAL RULES — follow without exception:
- Analyze ONLY visible candles, wicks, volatility, price zones, and recent momentum behavior.
- Never invent support/resistance levels, volume, order flow, indicators, or timeframes that are not readable.
- If the screenshot is incomplete, blurry, or missing context, state exactly what is missing.
- Separate facts ("visible on the chart") from risk interpretation ("what it means for position safety").
- Focus on capital protection: entry risk, stop-loss placement, position sizing clues, overextension signals, liquidity risks.
- Never mention backend tools, internal functions, JSON, or system architecture.
- If the setup looks overextended, volatile, weak, or illiquid, flag it directly.

RESPONSE FORMAT — follow exactly:

**1. Visible on Screenshot**
- Asset/pair [if readable]
- Timeframe [if visible; if not, say "Not visible"]
- Recent price action [e.g., "5 consecutive red candles", "wide range bar", "tight compression"]
- Volatility clues [e.g., "long wicks", "gap risk", "extreme range", "stable closes"]
- Momentum: [strong trend / weak trend / choppy / range-bound / unclear]

**2. Risk Factors Visible**
- Volatility level: [High / Moderate / Low]
- Recent behavior: [Trending cleanly / Choppy / Overextended / Breaking support]
- Wick behavior: [Clean closes / Rejection wicks / Wide ranges / Unstable]
- Setup quality for position entry: [Low risk / Moderate risk / High risk / Unclear]

**3. Stop-Loss Placement**
- Logical SL zone: [price level if clearly visible, or "Not readable from screenshot"]
- Risk to SL: [e.g., "tight range = small SL possible", "wide range = larger SL needed"]

**4. Position Sizing Warning**
[If the setup shows: overextension, wide ranges, weak momentum, or unstable closes, recommend smaller position. If compressed and clean, position size may be larger.]

**5. Capital Protection Flags**
- Liquidity risk: [None visible / Possible gap risk / Thin spread risk / Unclear]
- Volatility risk: [Stable / Moderate / Elevated / Extreme]
- Trend exhaustion: [None / Possible / Likely / Unclear]
- Entry risk: [Safe / Fair / Risky / Too risky]

**6. Cannot Confirm**
[What is missing: volume, order book, wider context, real-time data, exact timeframe, exchange slippage, funding rates, liquidation levels, etc.]

**7. Confidence Score**
[1–10, based on screenshot clarity and visible risk structure]

**FINAL VERDICT** [2–4 lines]
[Summary: is this setup capital-friendly or dangerous? What are the key risks? What data is needed for better risk assessment?]

Never exceed this format. Never add filler. Premium, concise, capital-protection-focused, mobile-first.`,
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

// Pending images attachment preview strip (above input) - supports up to 5 images
function AttachmentPreview({ imageDUrls, onRemove }) {
  if (!imageDUrls || imageDUrls.length === 0) return null;
  return (
    <div className="px-3 sm:px-4 pt-2 pb-0">
      <div className="flex gap-2 flex-wrap">
        {imageDUrls.map((url, idx) => (
          <div key={idx} className="relative inline-block">
            <img
              src={url}
              alt={`Attached chart ${idx + 1}`}
              className="h-16 w-auto rounded-lg border border-border object-cover"
            />
            <button
              onClick={() => onRemove(idx)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
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
  const [pendingImages, setPendingImages] = useState([]); // array of base64 data URLs (max 5)
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

  // Paste handler for chart screenshots - supports multiple images
  useEffect(() => {
    const handlePaste = (e) => {
      if (!selectedAgent) return;
      const items = Array.from(e.clipboardData?.items || []);
      const imageItems = items.filter(item => item.type.startsWith('image/'));
      imageItems.forEach(imageItem => {
        const file = imageItem.getAsFile();
        if (file) readImageFile(file);
      });
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedAgent]);

  const readImageFile = (file) => {
    if (pendingImages.length >= 5) return; // max 5 images
    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingImages(prev => [...prev, e.target.result]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => readImageFile(file));
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
    const hasImages = pendingImages.length > 0;
    if ((!hasText && !hasImages) || !selectedAgent || sending) return;

    const agentName = selectedAgent;
    let convId = activeConvId[agentName];

    if (!convId) {
      await startNewConversation(agentName);
      return;
    }

    const conv = { id: convId };
    setSending(true);
    const text = hasText ? input.trim() : '';
    const imagesToSend = [...pendingImages];
    setInput('');
    setPendingImages([]);

    // Build optimistic message with local previews (persistent)
    const optimisticMsg = {
      role: 'user',
      content: hasImages
        ? (text || 'Analyze these chart screenshots.')
        : text,
      _localImagePreviews: imagesToSend, // local only, not persisted, but displayed
    };

    setMessages(prev => {
      const key = `${agentName}:${convId}`;
      return { ...prev, [key]: [...(prev[key] || []), optimisticMsg] };
    });

    // If images: upload each and send with file_urls + chart-specific system prompt prepended
    if (hasImages) {
      const fileUrls = await Promise.all(imagesToSend.map(img => uploadImage(img)));
      const ag = AGENTS.find(a => a.name === agentName);
      const chartInstruction = ag?.chartPrompt || '';
      const messageContent = chartInstruction
        ? `${chartInstruction}\n\nUser note: ${text || 'Please analyze these chart screenshots.'}`
        : (text || 'Please analyze these chart screenshots.');

      await base44.agents.addMessage(conv, {
        role: 'user',
        content: messageContent,
        file_urls: fileUrls,
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

  const canSend = (input.trim() || pendingImages.length > 0) && !sending;

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

                {currentMessages.map((msg, i) => {
                   // Use local previews for optimistic updates, fallback to file_urls from backend
                   const imageUrls = msg._localImagePreviews || msg.file_urls || [];
                   return (
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
                       {/* Attached images preview in bubble (persistent) */}
                       {imageUrls.length > 0 && (
                         <div className={cn(
                           "px-3 pt-3 pb-2 flex gap-2 flex-wrap",
                           imageUrls.length === 1 ? "justify-center" : ""
                         )}>
                           {imageUrls.map((imgUrl, imgIdx) => (
                             <button
                               key={imgIdx}
                               onClick={() => setLightboxSrc(imgUrl)}
                               className="relative group block rounded-lg overflow-hidden"
                             >
                               <img
                                 src={imgUrl}
                                 alt={`Chart screenshot ${imgIdx + 1}`}
                                 className={cn(
                                   "rounded-lg object-cover border border-white/10",
                                   imageUrls.length === 1 ? "max-h-48 w-auto" : "max-h-40 w-auto"
                                 )}
                               />
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                 <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                               </div>
                             </button>
                           ))}
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
                   );
                })}

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

              {/* Hidden file input - accept multiple files */}
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 multiple
                 className="hidden"
                 onChange={handleFileChange}
               />

              {/* Pending attachments preview */}
              <AttachmentPreview
                imageDUrls={pendingImages}
                onRemove={(idx) => setPendingImages(prev => prev.filter((_, i) => i !== idx))}
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
                    placeholder={pendingImages.length > 0 ? 'Add a note or send images…' : `Ask ${agent?.label}…`}
                    className="flex-1 bg-secondary border-border text-sm h-10"
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!canSend}
                    size="icon"
                    className={cn("flex-shrink-0 w-10 h-10", pendingImages.length > 0 && "bg-blue-500 hover:bg-blue-600")}
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