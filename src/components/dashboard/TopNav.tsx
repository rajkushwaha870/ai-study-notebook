import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, Pin, Heart, Trash2, Sun, Moon, 
  CloudLightning, CloudCheck, CheckCircle2, RefreshCw
} from 'lucide-react';
import type { Subject, Note } from '../../utils/db';

interface TopNavProps {
  activeSubject: Subject | null;
  activeNote: Note | null;
  onToggleMobileSidebar: () => void;
  onTriggerSearch: () => void;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onDeleteNote: () => void;
  savingStatus: 'idle' | 'saving' | 'saved';
  activeTab: 'notes' | 'files';
  onTabChange: (tab: 'notes' | 'files') => void;
}

export default function TopNav({
  activeSubject,
  activeNote,
  onToggleMobileSidebar,
  onTriggerSearch,
  onTogglePin,
  onToggleFavorite,
  onDeleteNote,
  savingStatus,
  activeTab,
  onTabChange,
}: TopNavProps) {
  const [theme, setTheme] = useState<string>('light');

  // Detect theme class on <html> on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const handleThemeToggle = () => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setTheme('light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        setTheme('dark');
      }
    }
  };

  return (
    <header className="h-16 px-4 bg-canvas border-b border-hairline flex items-center justify-between shrink-0 select-none bg-canvas-soft-2/50 backdrop-blur-md sticky top-0 z-30">
      {/* Left side: Hamburger (Mobile) + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 hover:bg-canvas-soft-2 text-mute hover:text-ink rounded-sm transition-colors cursor-pointer"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-1.5 text-xs font-medium text-body overflow-hidden">
          {/* Breadcrumbs for desktop, simplified for mobile */}
          <span className="hidden md:inline text-mute font-mono">Workspace</span>
          <span className="hidden md:inline text-mute font-mono">/</span>
          
          {activeSubject && (
            <>
              <span className="hidden sm:inline font-semibold text-ink truncate max-w-[80px] sm:max-w-[120px]">
                {activeSubject.name}
              </span>
              <span className="hidden sm:inline text-mute font-mono">/</span>
            </>
          )}
          
          {!activeSubject && (
            <>
              <span className="hidden sm:inline font-semibold text-ink font-mono">
                {activeTab === 'files' ? 'All Files' : 'All Notes'}
              </span>
              <span className="hidden sm:inline text-mute font-mono">/</span>
            </>
          )}

          <span className="font-semibold text-ink truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px]">
            {activeTab === 'files' ? 'Files' : (activeNote ? (activeNote.title || 'Untitled Note') : (activeTab === 'files' ? 'All Files' : 'All Notes'))}
          </span>
        </div>
      </div>

      {/* Right side: Search shortcut trigger, AutoSave, Note Actions, Theme toggler */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mode Switcher Toggle Pill (Vercel style) */}
        <div className={`bg-canvas-soft border border-hairline rounded-full p-0.5 shrink-0 text-[10px] font-mono select-none mr-1 ${activeNote ? 'hidden sm:flex' : 'flex'}`}>
          <button
            onClick={() => onTabChange('notes')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-canvas text-ink font-semibold shadow-level-1'
                : 'text-body hover:text-ink'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => onTabChange('files')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-canvas text-ink font-semibold shadow-level-1'
                : 'text-body hover:text-ink'
            }`}
          >
            Files
          </button>
        </div>

        {/* Search Mock Trigger */}
        <button
          onClick={onTriggerSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-canvas border border-hairline hover:border-hairline-strong rounded-sm text-xs text-mute hover:text-ink transition-all cursor-pointer h-8 group max-w-[120px] sm:max-w-none"
        >
          <Search size={14} className="shrink-0 text-mute group-hover:text-ink transition-colors" />
          <span className="hidden sm:inline">Search notes...</span>
          <kbd className="hidden lg:inline-flex items-center justify-center h-4 px-1.5 bg-canvas-soft border border-hairline text-[9px] font-mono rounded-sm leading-none shrink-0 ml-1">
            ⌘K
          </kbd>
        </button>

        {/* Note Autosave Status */}
        {activeNote && (
          <div className="flex items-center gap-1.5 text-xs text-mute shrink-0 px-1 font-mono">
            {savingStatus === 'saving' && (
              <>
                <RefreshCw size={12} className="animate-spin text-warning" />
                <span className="hidden sm:inline text-warning-deep">Saving...</span>
              </>
            )}
            {savingStatus === 'saved' && (
              <>
                <CheckCircle2 size={12} className="text-link" />
                <span className="hidden sm:inline text-link-deep">Saved</span>
              </>
            )}
          </div>
        )}

        {/* Active Note actions (Pin, Fav, Delete) */}
        {activeNote && (
          <div className="flex items-center gap-1 border-l border-hairline pl-2 sm:pl-3">
            <button
              onClick={onTogglePin}
              className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                activeNote.pinned 
                  ? 'bg-canvas-soft text-[#ff4d4d] border border-hairline' 
                  : 'hover:bg-canvas-soft-2 text-mute hover:text-ink border border-transparent'
              }`}
              title={activeNote.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin size={14} className={activeNote.pinned ? 'fill-[#ff4d4d]' : ''} />
            </button>
            <button
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                activeNote.favorite 
                  ? 'bg-canvas-soft text-[#ff0080] border border-hairline' 
                  : 'hover:bg-canvas-soft-2 text-mute hover:text-[#ff0080] border border-transparent'
              }`}
              title={activeNote.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={14} className={activeNote.favorite ? 'fill-[#ff0080]' : ''} />
            </button>
            <button
              onClick={onDeleteNote}
              className="p-1.5 hover:bg-error-soft text-mute hover:text-error-deep rounded-sm border border-transparent transition-colors cursor-pointer"
              title="Delete note"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-1.5 hover:bg-canvas-soft-2 border border-transparent text-mute hover:text-ink rounded-sm transition-all cursor-pointer h-8 w-8 flex items-center justify-center shrink-0"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
