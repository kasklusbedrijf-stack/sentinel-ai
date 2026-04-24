/**
 * AgentImageLightbox Component
 * Extracted from AgentsPage to reduce complexity
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';

export function ImageLightbox({ src, onClose }) {
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

export function AttachmentPreview({ imageDUrls, onRemove }) {
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