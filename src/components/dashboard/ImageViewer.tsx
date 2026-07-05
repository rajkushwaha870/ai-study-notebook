import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  dataUrl: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function ImageViewer({
  isOpen,
  onClose,
  fileName,
  dataUrl,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: ImageViewerProps) {
  const [scale, setScale] = useState(1);

  // Reset zoom on open / change image
  useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen, dataUrl]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrev, onNext, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]/95 text-white select-none backdrop-blur-md animate-fade-in">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/50 tracking-wider">PREVIEW</span>
          <span className="text-xs text-white/30 font-mono">/</span>
          <h3 className="text-sm font-semibold text-white/90 truncate max-w-[200px] sm:max-w-md">
            {fileName}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-xs font-mono w-12 text-center text-white/70">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer ml-1"
            title="Reset Zoom"
          >
            <RefreshCw size={14} />
          </button>
          
          <span className="w-px h-5 bg-white/10 mx-2" />

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Close Viewer (Esc)"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main viewport area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6">
        {/* Navigation buttons */}
        {hasPrev && onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-6 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all hover:-translate-x-0.5 active:scale-95 z-20 cursor-pointer"
            title="Previous Image (←)"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-6 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all hover:translate-x-0.5 active:scale-95 z-20 cursor-pointer"
            title="Next Image (→)"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Zoomable Image frame */}
        <div className="w-full h-full flex items-center justify-center overflow-auto max-w-full max-h-full">
          <img
            src={dataUrl}
            alt={fileName}
            style={{ transform: `scale(${scale})` }}
            className="max-w-full max-h-full object-contain rounded-sm transition-transform duration-200 shadow-2xl ease-out pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
