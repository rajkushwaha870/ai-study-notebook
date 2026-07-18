import React, { useEffect, useState, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface PdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  dataUrl: string;
}

export default function PdfViewer({
  isOpen,
  onClose,
  fileName,
  dataUrl,
}: PdfViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert base64 PDF data to Blob URL on mount/change
  useEffect(() => {
    if (!isOpen || !dataUrl) {
      setBlobUrl('');
      return;
    }

    if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || dataUrl.startsWith('blob:')) {
      setBlobUrl(dataUrl);
      return;
    }

    try {
      const base64Content = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setBlobUrl(url);

      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Failed to parse base64 PDF to blob', e);
    }
  }, [isOpen, dataUrl]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        // Only close if not currently in fullscreen (exit fullscreen instead)
        if (!document.fullscreenElement) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Failed to enter fullscreen mode', err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen state if changed by browser overlay / escape
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#121212] text-white select-none backdrop-blur-md animate-fade-in"
    >
      {/* Viewer Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-b border-white/5 shrink-0 z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-xs font-mono text-white/50 tracking-wider">PDF READER</span>
          <span className="text-xs text-white/30 font-mono">/</span>
          <h3 className="text-sm font-semibold text-white/90 truncate max-w-[200px] sm:max-w-md">
            {fileName}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-sm hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          
          <span className="w-px h-5 bg-white/10" />

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Close Viewer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Embedded PDF iframe content */}
      <div className="flex-1 w-full h-full bg-[#1e1e1e] relative">
        {blobUrl ? (
          <iframe 
            src={`${blobUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-none"
            title={fileName}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white/40">
            Generating document interface...
          </div>
        )}
      </div>
    </div>
  );
}
