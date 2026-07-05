import React, { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface TextViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  dataUrl: string;
}

export default function TextViewer({
  isOpen,
  onClose,
  fileName,
  dataUrl,
}: TextViewerProps) {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !dataUrl) {
      setText('');
      return;
    }

    try {
      const base64Content = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      const decodedText = atob(base64Content);
      setText(decodedText);
    } catch (e) {
      setText('Failed to load text content.');
    }
  }, [isOpen, dataUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs animate-fade-in p-4">
      <div 
        className="w-full max-w-2xl bg-canvas border border-hairline rounded-lg shadow-level-5 flex flex-col max-h-[85vh] animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-soft shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-mute">TEXT VIEWER</span>
            <span className="text-mute">/</span>
            <h3 className="text-sm font-semibold text-ink truncate max-w-[200px] sm:max-w-md">
              {fileName}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-canvas-soft-2 text-mute hover:text-ink rounded-sm transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Copy content"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-link" />
                  <span className="text-link font-mono text-[10px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="font-mono text-[10px]">Copy</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-canvas-soft-2 rounded-full text-mute hover:text-ink transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Text Area Content */}
        <div className="flex-1 overflow-auto p-6 bg-canvas-soft-2/40">
          <pre className="font-mono text-xs text-ink/90 leading-relaxed whitespace-pre-wrap select-text selection:bg-primary selection:text-on-primary">
            {text}
          </pre>
        </div>
      </div>
    </div>
  );
}
