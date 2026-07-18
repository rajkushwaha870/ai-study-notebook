import React from 'react';
import { Pin, Heart, Plus, FileText, Calendar } from 'lucide-react';
import type { Note, Subject } from '../../utils/db';

interface NoteListProps {
  notes: Note[];
  subjects: Subject[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  activeSubjectId: string | null;
}

export default function NoteList({
  notes,
  subjects,
  activeNoteId,
  onSelectNote,
  onAddNote,
  activeSubjectId,
}: NoteListProps) {

  // Helper to get subject details
  const getSubjectDetails = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId);
  };

  const getSubjectColorClass = (color?: string) => {
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

  // Helper to format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    
    // Check if today
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Return standard date
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Helper to strip HTML and get text snippet
  const getTextSnippet = (htmlContent: string) => {
    if (!htmlContent) return 'Empty note';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > 60 ? text.substring(0, 60) + '...' : text || 'Empty note';
  };

  // Sort notes: pinned first, then by updatedAt descending
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="w-full sm:w-80 border-r border-hairline h-full flex flex-col bg-canvas-soft select-none shrink-0">
      {/* Header with quick creation action */}
      <div className="p-4 border-b border-hairline flex items-center justify-between bg-canvas-soft shrink-0">
        <span className="text-xs font-mono uppercase tracking-wider text-mute">
          Notes list ({notes.length})
        </span>
        <button
          onClick={onAddNote}
          className="flex items-center gap-1 px-2.5 py-1 bg-primary text-on-primary text-xs rounded-full hover:opacity-90 active:scale-[0.98] transition-all font-medium cursor-pointer"
          title="Create new note"
        >
          <Plus size={12} />
          New Note
        </button>
      </div>

      {/* Dynamic Scrollable Note items */}
      <div className="flex-1 overflow-y-auto divide-y divide-hairline">
        {sortedNotes.map((note) => {
          const sub = getSubjectDetails(note.subjectId);
          const isActive = activeNoteId === note.id;

          return (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`p-4 text-left cursor-pointer transition-all border-l-[3px] ${
                isActive 
                  ? 'bg-canvas border-l-primary shadow-level-2' 
                  : 'hover:bg-canvas-soft-2/50 border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-1">
                <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-ink font-semibold' : 'text-ink/80'}`}>
                  {note.title || 'Untitled Note'}
                </h4>
                <div className="flex items-center gap-1 shrink-0">
                  {note.pinned && <Pin size={10} className="text-[#ff4d4d] fill-[#ff4d4d]" />}
                  {note.favorite && <Heart size={10} className="text-[#ff0080] fill-[#ff0080]" />}
                </div>
              </div>

              {/* Text preview snippet */}
              <p className="text-xs text-body mb-3 line-clamp-2 leading-relaxed">
                {getTextSnippet(note.content)}
              </p>

              {/* Date and Subject color tags */}
              <div className="flex items-center justify-between text-[10px] text-mute font-mono">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(note.updatedAt)}
                </span>
                
                {sub && (
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${getSubjectColorClass(sub.color)}`} />
                    {sub.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {sortedNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-mute mt-12">
            <FileText size={32} className="stroke-[1.5] mb-2 text-mute/50" />
            <p className="text-xs">No notes found.</p>
            <button
              onClick={onAddNote}
              className="mt-3 text-xs text-link hover:underline font-medium cursor-pointer"
            >
              Create one now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
