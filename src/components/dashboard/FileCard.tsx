import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, MoreVertical, Download, Edit2, Trash2, 
  RotateCcw, FileText, Image as ImageIcon, Presentation, Eye 
} from 'lucide-react';
import type { FileRecord } from '../../utils/db';

interface FileCardProps {
  file: FileRecord;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onPreview: (file: FileRecord) => void;
  onDownload: (file: FileRecord) => void;
}

export default function FileCard({
  file,
  onToggleFavorite,
  onDelete,
  onRestore,
  onRename,
  onPreview,
  onDownload,
}: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus rename input
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  // Size formatting helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Date formatting helper
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Icon mapping
  const getFileIcon = () => {
    const type = file.type.toLowerCase();
    if (type.includes('pdf')) {
      return <FileText className="text-error" size={24} />;
    }
    if (type.includes('image')) {
      return <ImageIcon className="text-violet" size={24} />;
    }
    if (type.includes('plain')) {
      return <FileText className="text-body" size={24} />;
    }
    if (type.includes('word') || type.includes('document')) {
      return <FileText className="text-link" size={24} />;
    }
    if (type.includes('presentation') || type.includes('powerpoint')) {
      return <Presentation className="text-warning" size={24} />;
    }
    return <FileText className="text-mute" size={24} />;
  };

  // Handle Rename Submit
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName.trim() !== file.name) {
      onRename(file.id, newName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div 
      className={`group relative bg-canvas border border-hairline rounded-md p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-level-3 select-none flex flex-col justify-between min-h-[140px] ${
        file.inTrash ? 'opacity-85 hover:opacity-100' : ''
      }`}
    >
      {/* Top Header Row: Icon + Actions */}
      <div className="flex items-start justify-between">
        <div className="p-2 bg-canvas-soft border border-hairline rounded-sm shadow-level-1 shrink-0">
          {getFileIcon()}
        </div>

        {/* Action controls buttons */}
        <div className="flex items-center gap-1.5 relative shrink-0">
          {!file.inTrash && (
            <button
              onClick={() => onToggleFavorite(file.id)}
              className={`p-1.5 rounded-full border border-transparent transition-all cursor-pointer ${
                file.favorite 
                  ? 'bg-highlight-pink/5 hover:bg-highlight-pink/10 text-highlight-pink' 
                  : 'hover:bg-canvas-soft-2 text-mute hover:text-ink'
              }`}
              title={file.favorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Heart size={13} className={file.favorite ? 'fill-current' : ''} />
            </button>
          )}

          {/* Settings / Actions Dropdown Trigger */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full hover:bg-canvas-soft-2 text-mute hover:text-ink transition-colors cursor-pointer border border-transparent"
          >
            <MoreVertical size={13} />
          </button>

          {/* Dropdown Menu (Vercel stark visual theme) */}
          {showMenu && (
            <div 
              ref={menuRef}
              className="absolute right-0 top-7 w-36 bg-canvas border border-hairline rounded-sm shadow-level-5 py-1 z-30 font-mono text-[10px] animate-scale-up"
            >
              {file.inTrash ? (
                <>
                  {onRestore && (
                    <button
                      onClick={() => { onRestore(file.id); setShowMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-body hover:text-ink hover:bg-canvas-soft-2 flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw size={11} />
                      Restore
                    </button>
                  )}
                  <button
                    onClick={() => { onDelete(file.id); setShowMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-error-deep hover:bg-error-soft flex items-center gap-2 cursor-pointer border-t border-hairline"
                  >
                    <Trash2 size={11} />
                    Delete Forever
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onPreview(file); setShowMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-body hover:text-ink hover:bg-canvas-soft-2 flex items-center gap-2 cursor-pointer"
                  >
                    <Eye size={11} />
                    Preview
                  </button>
                  <button
                    onClick={() => { onDownload(file); setShowMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-body hover:text-ink hover:bg-canvas-soft-2 flex items-center gap-2 cursor-pointer"
                  >
                    <Download size={11} />
                    Download
                  </button>
                  <button
                    onClick={() => { setIsRenaming(true); setShowMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-body hover:text-ink hover:bg-canvas-soft-2 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 size={11} />
                    Rename
                  </button>
                  <button
                    onClick={() => { onDelete(file.id); setShowMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-error-deep hover:bg-error-soft flex items-center gap-2 cursor-pointer border-t border-hairline font-semibold"
                  >
                    <Trash2 size={11} />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Title (Standard or Rename mode) */}
      <div className="mt-3.5 flex-1 min-w-0">
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="w-full">
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => {
                if (newName.trim() && newName.trim() !== file.name) {
                  onRename(file.id, newName.trim());
                }
                setIsRenaming(false);
              }}
              className="w-full px-2 py-1 bg-canvas border border-primary/20 rounded-sm text-xs font-semibold focus:outline-none focus:border-primary text-ink"
            />
          </form>
        ) : (
          <h4 
            onClick={() => !file.inTrash && onPreview(file)}
            className="text-xs font-semibold text-ink leading-snug cursor-pointer hover:underline truncate group-hover:text-primary transition-all"
            title={file.name}
          >
            {file.name}
          </h4>
        )}
      </div>

      {/* Bottom Row: Metadata Size + Date */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-mute font-mono shrink-0">
        <span>{formatBytes(file.size)}</span>
        <span>{formatDate(file.createdAt)}</span>
      </div>
    </div>
  );
}
