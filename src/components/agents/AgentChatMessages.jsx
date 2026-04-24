/**
 * AgentChatMessages Component
 * Renders chat message list (extracted from AgentsPage)
 */

import { useRef, useEffect } from 'react';
import { Loader2, Bot, ZoomIn } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export function AgentChatMessages({
  messages,
  sending,
  onImageClick,
  t,
  extractUserContent
}) {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sending]);

  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
      {messages.map((msg, i) => {
        const imageUrls = msg._localImagePreviews || msg.file_urls || [];
        const displayContent = msg.role === 'user'
          ? (msg._userText || extractUserContent(msg.content))
          : msg.content;

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
              {/* Images */}
              {imageUrls.length > 0 && (
                <div className={cn(
                  "px-3 pt-3 pb-2 flex gap-2 flex-wrap",
                  imageUrls.length === 1 ? "justify-center" : ""
                )}>
                  {imageUrls.map((imgUrl, imgIdx) => (
                    <button
                      key={imgIdx}
                      onClick={() => onImageClick(imgUrl)}
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
              
              {/* Content */}
              {displayContent?.trim() && (
                <div className="px-3.5 sm:px-4 py-2.5 sm:py-3">
                  {msg.role === 'user' ? (
                    <p className="leading-relaxed break-words text-sm">{displayContent}</p>
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
                      {displayContent}
                    </ReactMarkdown>
                  )}
                  {msg.tool_calls?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.tool_calls.map((tc, ti) => (
                        <div key={ti} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 min-w-0">
                          <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", tc.status === 'completed' ? 'bg-green-400' : tc.status === 'running' ? 'bg-yellow-400 animate-pulse' : 'bg-muted-foreground')} />
                          <span className="font-mono truncate">{tc.name || t('global_no_data')}</span>
                          <span className="text-muted-foreground flex-shrink-0">{tc.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
            <span className="text-sm text-muted-foreground">{t('agents_analyzing')}</span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}