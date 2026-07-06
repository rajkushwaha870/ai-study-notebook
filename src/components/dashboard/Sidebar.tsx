import React from 'react';
import { 
  LogOut, Plus, Heart, Pin, BookOpen, Cpu, Percent, 
  Languages, GraduationCap, Award, Calendar, Lightbulb, 
  Settings, FolderPlus, List, ChevronLeft, User2, Folder, Clock, Trash2,
  Sparkles, Bot
} from 'lucide-react';
import type { Subject, User } from '../../utils/db';

interface SidebarProps {
  user: User;
  subjects: Subject[];
  activeSubjectId: string | null; // null represents 'all'
  activeFilter: string;
  onSelectSubject: (id: string | null) => void;
  onSelectFilter: (filter: string) => void;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onLogout: () => void;
  isOpen: boolean; // Mobile open state
  onToggleMobile: () => void;
  isCollapsed: boolean; // Desktop collapsed state
  onToggleCollapse: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Cpu, Percent, Languages, GraduationCap, Award, BookOpen, Calendar, Lightbulb
};

export default function Sidebar({
  user,
  subjects,
  activeSubjectId,
  activeFilter,
  onSelectSubject,
  onSelectFilter,
  onAddSubject,
  onEditSubject,
  onLogout,
  isOpen,
  onToggleMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {

  const handleFilterClick = (filter: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
      window.location.href = `/dashboard?filter=${filter}`;
      return;
    }
    onSelectFilter(filter);
    onSelectSubject(null);
  };

  const handleSubjectClick = (id: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
      window.location.href = `/dashboard?subject=${id}`;
      return;
    }
    onSelectSubject(id);
  };

  const getSubjectColorClass = (color: string) => {
    switch (color) {
      case 'link': return 'bg-[#0070f3]';
      case 'violet': return 'bg-[#7928ca]';
      case 'highlight-pink': return 'bg-[#ff0080]';
      case 'cyan-deep': return 'bg-[#29bc9b]';
      case 'warning': return 'bg-[#f5a623]';
      case 'error': return 'bg-[#ee0000]';
      default: return 'bg-mute';
    }
  };

  const renderSubjectIcon = (iconName: string, color: string) => {
    const IconComp = ICON_MAP[iconName] || BookOpen;
    return <IconComp size={16} className="shrink-0" />;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-canvas text-ink select-none">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-hairline shrink-0 bg-canvas-soft">
        <div className="flex items-center gap-2 font-semibold">
          <div className="w-6 h-6 bg-primary text-on-primary flex items-center justify-center rounded-sm text-xs font-bold tracking-tight shadow-sm font-mono">
            N
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold tracking-tight text-ink">
              NoteBook.
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 hover:bg-canvas-soft-2 text-mute hover:text-ink rounded-sm transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation Filter Links */}
      <div className="p-3 space-y-1">
        {/* Notes section */}
        {!isCollapsed && (
          <div className="px-3 mb-1.5 text-[9px] font-mono uppercase tracking-wider text-mute">
            Notes
          </div>
        )}
        <button
          onClick={() => handleFilterClick('all')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-all cursor-pointer ${
            activeSubjectId === null && activeFilter === 'all'
              ? 'bg-canvas-soft border border-hairline font-semibold shadow-level-1'
              : 'hover:bg-canvas-soft-2 border border-transparent text-body hover:text-ink'
          }`}
        >
          <List size={16} className="shrink-0 text-mute" />
          {!isCollapsed && <span>All Notes</span>}
        </button>

        <button
          onClick={() => handleFilterClick('pinned')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-all cursor-pointer ${
            activeSubjectId === null && activeFilter === 'pinned'
              ? 'bg-canvas-soft border border-hairline font-semibold shadow-level-1'
              : 'hover:bg-canvas-soft-2 border border-transparent text-body hover:text-ink'
          }`}
        >
          <Pin size={16} className="shrink-0 text-mute" />
          {!isCollapsed && <span>Pinned Notes</span>}
        </button>

        <button
          onClick={() => handleFilterClick('favorites')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-all cursor-pointer ${
            activeSubjectId === null && activeFilter === 'favorites'
              ? 'bg-canvas-soft border border-hairline font-semibold shadow-level-1'
              : 'hover:bg-canvas-soft-2 border border-transparent text-body hover:text-ink'
          }`}
        >
          <Heart size={16} className="shrink-0 text-mute" />
          {!isCollapsed && <span>Favorites</span>}
        </button>

        {/* Files section */}
        {!isCollapsed && (
          <div className="px-3 pt-3 mb-1.5 text-[9px] font-mono uppercase tracking-wider text-mute">
            Files
          </div>
        )}
        <button
          onClick={() => handleFilterClick('all-files')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-all cursor-pointer ${
            activeSubjectId === null && activeFilter === 'all-files'
              ? 'bg-canvas-soft border border-hairline font-semibold shadow-level-1'
              : 'hover:bg-canvas-soft-2 border border-transparent text-body hover:text-ink'
          }`}
        >
          <Folder size={16} className="shrink-0 text-mute" />
          {!isCollapsed && <span>All Files</span>}
        </button>

        <button
          onClick={() => handleFilterClick('recent-files')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-all cursor-pointer ${
            activeSubjectId === null && activeFilter === 'recent-files'
              ? 'bg-canvas-soft border border-hairline font-semibold shadow-level-1'
              : 'hover:bg-canvas-soft-2 border border-transparent text-body hover:text-ink'
          }`}
        >
          <Clock size={16} className="shrink-0 text-mute" />
          {!isCollapsed && <span>Recent Files</span>}
        </button>

        <button
          onClick={() => handleFilterClick('trash')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-all cursor-pointer ${
            activeSubjectId === null && activeFilter === 'trash'
              ? 'bg-canvas-soft border border-hairline font-semibold shadow-level-1'
              : 'hover:bg-canvas-soft-2 border border-transparent text-body hover:text-ink'
          }`}
        >
          <Trash2 size={16} className="shrink-0 text-mute" />
          {!isCollapsed && <span>Trash</span>}
        </button>

        {/* AI Tools section */}
        {!isCollapsed && (
          <div className="px-3 pt-3 mb-1.5 text-[9px] font-mono uppercase tracking-wider text-mute">
            AI Tools
          </div>
        )}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') window.location.href = '/ai';
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-all cursor-pointer ${
            typeof window !== 'undefined' && window.location.pathname === '/ai'
              ? 'bg-canvas-soft border border-hairline font-semibold shadow-level-1 text-ink'
              : 'hover:bg-canvas-soft-2 border border-transparent text-body hover:text-ink'
          }`}
        >
          <Sparkles size={16} className={`shrink-0 ${typeof window !== 'undefined' && window.location.pathname === '/ai' ? 'text-violet' : 'text-mute'}`} />
          {!isCollapsed && <span>AI Assistant</span>}
        </button>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') window.location.href = '/settings';
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-all cursor-pointer ${
            typeof window !== 'undefined' && window.location.pathname === '/settings'
              ? 'bg-canvas-soft border border-hairline font-semibold shadow-level-1 text-ink'
              : 'hover:bg-canvas-soft-2 border border-transparent text-body hover:text-ink'
          }`}
        >
          <Bot size={16} className={`shrink-0 ${typeof window !== 'undefined' && window.location.pathname === '/settings' ? 'text-violet' : 'text-mute'}`} />
          {!isCollapsed && <span>AI Settings</span>}
        </button>
      </div>

      <hr className="border-hairline mx-3" />

      {/* Subjects Header Section */}
      <div className="p-3 flex-1 overflow-y-auto min-h-0 space-y-4">
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            {!isCollapsed ? (
              <span className="text-[10px] font-mono uppercase tracking-wider text-mute">
                Subjects
              </span>
            ) : (
              <span className="w-full border-b border-hairline block my-1" />
            )}
            {!isCollapsed && (
              <button
                onClick={onAddSubject}
                className="p-1 hover:bg-canvas-soft-2 text-mute hover:text-ink rounded-full transition-colors cursor-pointer"
                title="Create a new subject"
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className={`group w-full flex items-center justify-between rounded-sm border transition-all ${
                  activeSubjectId === sub.id
                    ? 'bg-canvas-soft border-hairline font-semibold text-ink shadow-level-1'
                    : 'hover:bg-canvas-soft-2 border-transparent text-body hover:text-ink'
                }`}
              >
                <button
                  onClick={() => handleSubjectClick(sub.id)}
                  className="flex-1 flex items-center gap-3 px-3 py-2 text-xs font-medium text-left cursor-pointer overflow-hidden"
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 flex items-center justify-center ${getSubjectColorClass(sub.color)}`} />
                  {!isCollapsed && (
                    <span className="truncate flex items-center gap-1.5">
                      {renderSubjectIcon(sub.icon, sub.color)}
                      {sub.name}
                    </span>
                  )}
                </button>
                {!isCollapsed && (
                  <button
                    onClick={() => onEditSubject(sub)}
                    className="opacity-0 group-hover:opacity-100 p-1 mr-2 text-mute hover:text-ink hover:bg-canvas-soft rounded-sm transition-all cursor-pointer shrink-0"
                    title="Edit subject"
                  >
                    <Settings size={12} />
                  </button>
                )}
              </div>
            ))}

            {subjects.length === 0 && !isCollapsed && (
              <div className="px-3 py-4 text-center text-xs text-mute border border-dashed border-hairline rounded-sm">
                No subjects yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Section at bottom */}
      <div className="p-3 border-t border-hairline bg-canvas-soft shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-canvas-soft-2 border border-hairline flex items-center justify-center shrink-0 text-mute">
              <User2 size={16} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-ink truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-mute truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={onLogout}
              className="p-2 hover:bg-canvas-soft-2 text-mute hover:text-error-deep rounded-sm transition-colors cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:block border-r border-hairline h-full shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onToggleMobile}
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs animate-fade-in"
        />
      )}

      {/* Mobile Drawer Content */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-45 w-60 border-r border-hairline bg-canvas shadow-level-5 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
