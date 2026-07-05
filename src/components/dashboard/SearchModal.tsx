import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Folder, CornerDownLeft, File } from 'lucide-react';
import type { Note, Subject, FileRecord } from '../../utils/db';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  subjects: Subject[];
  files: FileRecord[];
  onSelectNote: (noteId: string) => void;
  onSelectSubject: (subjectId: string) => void;
  onSelectFile: (fileId: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  notes,
  subjects,
  files,
  onSelectNote,
  onSelectSubject,
  onSelectFile,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    notes: Note[];
    subjects: Subject[];
    files: FileRecord[];
  }>({ notes: [], subjects: [], files: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener to trigger opening
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults({ notes: [], subjects: [], files: [] });
      return;
    }

    const q = query.toLowerCase();

    // Search notes
    const matchedNotes = notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );

    // Search subjects
    const matchedSubjects = subjects.filter((s) => s.name.toLowerCase().includes(q));

    // Search files (only those not in trash)
    const matchedFiles = files.filter(
      (f) => !f.inTrash && f.name.toLowerCase().includes(q)
    );

    setResults({ notes: matchedNotes, subjects: matchedSubjects, files: matchedFiles });
    setSelectedIndex(0);
  }, [query, notes, subjects, files]);

  const totalResultsCount = results.notes.length + results.subjects.length + results.files.length;

  // Keyboard navigation within search items
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (totalResultsCount === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalResultsCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalResultsCount) % totalResultsCount);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      triggerSelection(selectedIndex);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const triggerSelection = (index: number) => {
    if (index < results.notes.length) {
      // Note selection
      const note = results.notes[index];
      onSelectNote(note.id);
    } else if (index < results.notes.length + results.subjects.length) {
      // Subject selection
      const subjectIndex = index - results.notes.length;
      const subject = results.subjects[subjectIndex];
      onSelectSubject(subject.id);
    } else {
      // File selection
      const fileIndex = index - results.notes.length - results.subjects.length;
      const file = results.files[fileIndex];
      onSelectFile(file.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/45 backdrop-blur-xs animate-fade-in p-4"
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        className="w-full max-w-xl bg-canvas border border-hairline rounded-lg shadow-level-5 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="relative border-b border-hairline flex items-center px-4 bg-canvas">
          <Search size={18} className="text-mute mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 bg-transparent border-none text-ink text-sm focus:outline-none placeholder:text-mute"
            placeholder="Search notes, subjects, files, or keywords..."
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-canvas-soft-2 rounded-full text-mute hover:text-ink transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[350px] overflow-y-auto p-2 bg-canvas">
          {!query.trim() && (
            <div className="p-8 text-center text-xs text-mute font-mono">
              Type to start searching...
            </div>
          )}

          {query.trim() && totalResultsCount === 0 && (
            <div className="p-8 text-center text-xs text-mute font-mono">
              No results found for "{query}".
            </div>
          )}

          {/* Notes matched */}
          {results.notes.length > 0 && (
            <div className="mb-3">
              <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-mute">
                Notes ({results.notes.length})
              </div>
              <div className="space-y-0.5">
                {results.notes.map((note, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <button
                      key={note.id}
                      onClick={() => {
                        onSelectNote(note.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-left transition-all text-xs cursor-pointer ${
                        isActive ? 'bg-canvas-soft-2 text-ink font-semibold' : 'text-body hover:bg-canvas-soft'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={14} className="text-mute shrink-0" />
                        <span className="truncate">{note.title || 'Untitled Note'}</span>
                      </div>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[9px] text-mute font-mono">
                          Select
                          <CornerDownLeft size={10} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subjects matched */}
          {results.subjects.length > 0 && (
            <div className="mb-3">
              <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-mute">
                Subjects ({results.subjects.length})
              </div>
              <div className="space-y-0.5">
                {results.subjects.map((sub, index) => {
                  const globalIndex = results.notes.length + index;
                  const isActive = globalIndex === selectedIndex;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        onSelectSubject(sub.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-left transition-all text-xs cursor-pointer ${
                        isActive ? 'bg-canvas-soft-2 text-ink font-semibold' : 'text-body hover:bg-canvas-soft'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder size={14} className="text-mute shrink-0" />
                        <span className="truncate">{sub.name}</span>
                      </div>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[9px] text-mute font-mono">
                          Open Folder
                          <CornerDownLeft size={10} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Files matched */}
          {results.files.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-mute">
                Uploaded Files ({results.files.length})
              </div>
              <div className="space-y-0.5">
                {results.files.map((file, index) => {
                  const globalIndex = results.notes.length + results.subjects.length + index;
                  const isActive = globalIndex === selectedIndex;
                  return (
                    <button
                      key={file.id}
                      onClick={() => {
                        onSelectFile(file.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-left transition-all text-xs cursor-pointer ${
                        isActive ? 'bg-canvas-soft-2 text-ink font-semibold' : 'text-body hover:bg-canvas-soft'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <File size={14} className="text-mute shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[9px] text-mute font-mono">
                          Preview File
                          <CornerDownLeft size={10} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Command Menu Footer */}
        <div className="px-4 py-2.5 border-t border-hairline bg-canvas-soft flex items-center justify-between text-[10px] text-mute font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigation</span>
            <span>↵ Select</span>
          </div>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
