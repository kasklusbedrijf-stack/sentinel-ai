import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Plus, ChevronRight, Loader2, ImagePlus, X, ZoomIn, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { cn } from '@/lib/utils';
import { getAgents } from '@/lib/agentConfig';
import { useAgentConversations } from '@/hooks/useAgentConversations';
import { ImageLightbox, AttachmentPreview } from '@/components/agents/AgentImageLightbox';
import { AgentChatMessages } from '@/components/agents/AgentChatMessages';

export default function AgentsPage() {
  const { t, language } = useAppPreferences();
  const AGENTS = getAgents(language);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const fileInputRef = useRef(null);

  const {
    conversations,
    activeConvId,
    messages,
    setMessages,
    startNewConversation,
    loadConversation,
  } = useAgentConversations(AGENTS);

  const agent = AGENTS.find(a => a.name === selectedAgent);

  // Paste handler for chart screenshots
  useEffect(() => {
    const handlePaste = (e) => {
      if (!selectedAgent) return;
      const items = Array.from(e.clipboardData?.items || []);
      items.filter(item => item.type.startsWith('image/')).forEach(imageItem => {
        const file = imageItem.getAsFile();
        if (file) readImageFile(file);
      });
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedAgent]);

  const readImageFile = (file) => {
    if (pendingImages.length >= 5) return;
    const reader = new FileReader();
    reader.onload = (e) => setPendingImages(prev => [...prev, e.target.result]);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    Array.from(e.target.files || []).forEach(file => readImageFile(file));
    e.target.value = '';
  };

  const handleSelectAgent = async (agentName) => {
    if (!activeConvId[agentName]) {
      await startNewConversation(agentName);
    } else {
      await loadConversation(agentName, activeConvId[agentName]);
    }
    setSelectedAgent(agentName);
    setShowArchive(false);
  };

  const handleNewConversation = async (agentName) => {
    await startNewConversation(agentName);
    setSelectedAgent(agentName);
    setShowArchive(false);
  };

  const handleLoadConversation = async (agentName, convId) => {
    await loadConversation(agentName, convId);
    setSelectedAgent(agentName);
    setShowArchive(false);
  };

  const uploadImage = async (dataUrl) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'chart.png', { type: blob.type });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  };

  const extractUserContent = (fullContent) => {
    const match = fullContent.match(/\n\nUser note: (.*)$/s);
    return match ? match[1] : fullContent;
  };

  const sendMessage = async () => {
    const hasText = input.trim();
    const hasImages = pendingImages.length > 0;
    if ((!hasText && !hasImages) || !selectedAgent || sending) return;

    const agentName = selectedAgent;
    let convId = activeConvId[agentName];

    if (!convId) {
      await handleNewConversation(agentName);
      return;
    }

    const conv = { id: convId };
    setSending(true);
    const text = hasText ? input.trim() : '';
    const imagesToSend = [...pendingImages];
    setInput('');
    setPendingImages([]);

    const userNote = text || (hasImages ? 'Analyze these chart screenshots.' : '');

    const optimisticMsg = {
      role: 'user',
      content: userNote,
      _userText: userNote,
      _localImagePreviews: imagesToSend,
    };

    setMessages(prev => {
      const key = `${agentName}:${convId}`;
      return { ...prev, [key]: [...(prev[key] || []), optimisticMsg] };
    });

    if (hasImages) {
      const fileUrls = await Promise.all(imagesToSend.map(img => uploadImage(img)));
      const ag = AGENTS.find(a => a.name === agentName);
      const chartInstruction = ag?.chartPrompt || '';
      const backendContent = chartInstruction
        ? `${chartInstruction}\n\nUser note: ${userNote}`
        : userNote;

      await base44.agents.addMessage(conv, {
        role: 'user',
        content: backendContent,
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
        {/* Archive modal */}
        {showArchive && selectedAgent && (
          <div className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl w-full sm:max-w-md max-h-[70vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
                <h3 className="text-sm font-semibold">{t('agents_chat_history')} — {agent?.label}</h3>
                <button onClick={() => setShowArchive(false)} className="p-1 hover:bg-secondary rounded"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto flex-1 space-y-1 p-2">
                {conversations[selectedAgent]?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">{t('agents_no_chats')}</p>
                ) : (
                  conversations[selectedAgent]?.map(conv => {
                    const convKey = `${selectedAgent}:${conv.id}`;
                    const convMessages = messages[convKey] || conv.messages || [];
                    const lastMsg = convMessages[convMessages.length - 1];
                    const isActive = activeConvId[selectedAgent] === conv.id;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleLoadConversation(selectedAgent, conv.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all border",
                          isActive ? 'bg-primary/10 border-primary/25' : 'bg-muted border-border hover:bg-accent/40'
                        )}
                      >
                        <div className="font-semibold text-foreground truncate">{conv.metadata?.name || `Chat - ${new Date(conv.created_date).toLocaleDateString()}`}</div>
                        {lastMsg && <div className="text-muted-foreground truncate mt-0.5">{lastMsg.content?.substring(0, 50)}</div>}
                        <div className="text-muted-foreground/60 text-[10px] mt-1">{new Date(conv.created_date).toLocaleString()}</div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar: agent list */}
        <div className={cn(
          "border-r border-border bg-card/50 flex flex-col flex-shrink-0 transition-all",
          "w-full sm:w-64",
          selectedAgent ? "hidden sm:flex" : "flex"
        )}>
          <div className="px-4 py-4 border-b border-border">
            <h2 className="font-bold text-base flex items-center gap-2"><Bot className="w-4 h-4 text-primary" /> {t('agents_title')}</h2>
            <p className="text-xs text-muted-foreground mt-1">{t('agents_chat_with')}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {AGENTS.map(ag => {
              const Icon = ag.icon;
              const isActive = selectedAgent === ag.name;
              return (
                <button
                  key={ag.name}
                  onClick={() => handleSelectAgent(ag.name)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all border",
                    isActive ? 'bg-primary/10 border-primary/25 shadow-sm' : 'bg-card border-border hover:border-border hover:bg-accent/40'
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
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
              <ZoomIn className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-snug">{t('agents_upload_chart')}</p>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className={cn("flex-1 flex flex-col min-w-0", !selectedAgent && "hidden sm:flex")}>
          {!selectedAgent ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-lg">
                <Bot className="w-14 h-14 text-primary/40 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">{t('agents_title')}</h2>
                <p className="text-muted-foreground text-sm mb-6">{t('agents_chat_with')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {AGENTS.map(ag => {
                    const Icon = ag.icon;
                    return (
                      <button
                        key={ag.name}
                        onClick={() => handleNewConversation(ag.name)}
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
                  title={t('global_close')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {(() => { const ag = AGENTS.find(a => a.name === selectedAgent); const Icon = ag?.icon; return Icon ? <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0", ag.color)}><Icon className="w-4 h-4" /></div> : null; })()}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight">{agent?.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{agent?.description.split('.')[0]}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowArchive(true)} className="gap-1 flex-shrink-0 text-xs h-8 px-2 hidden sm:inline-flex" title={t('agents_view_history')}>
                  <BarChart2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleNewConversation(selectedAgent)} className="gap-1.5 flex-shrink-0 text-xs h-8 px-2.5">
                  <Plus className="w-3 h-3" /> {t('agents_new_chat')}
                </Button>
              </div>

              {/* Messages */}
              {currentMessages.length === 0 ? (
                <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
                  <div className="flex flex-col items-center pt-10 pb-4 px-2 text-center">
                    <p className="text-muted-foreground text-sm mb-5">{t('agents_start_conversation')} {agent?.label}</p>
                    {conversations[selectedAgent]?.length > 0 && (
                      <button
                        onClick={() => setShowArchive(true)}
                        className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all mb-4 sm:hidden"
                      >
                        {t('agents_view_history')} ({conversations[selectedAgent].length})
                      </button>
                    )}
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
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary/30 text-xs text-primary/70 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all w-full max-w-sm"
                    >
                      <ImagePlus className="w-4 h-4 flex-shrink-0" />
                      <span>{t('agents_upload_chart')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <AgentChatMessages
                  messages={currentMessages}
                  sending={sending}
                  onImageClick={setLightboxSrc}
                  t={t}
                  extractUserContent={extractUserContent}
                />
              )}

              {/* Hidden file input */}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-10 h-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title={t('agents_upload_chart')}
                  >
                    <ImagePlus className="w-4 h-4" />
                  </Button>
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={pendingImages.length > 0 ? t('agents_add_note') : `${t('agents_ask')} ${agent?.label}…`}
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