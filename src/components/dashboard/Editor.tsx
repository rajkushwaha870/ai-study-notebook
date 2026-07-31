import React, { useEffect, useRef, useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Quote, Code, FileCode2, AlignLeft, Info
} from 'lucide-react';
import type { Note } from '../../utils/db';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onSavingChange: (status: 'idle' | 'saving' | 'saved') => void;
}

export default function Editor({
  note,
  onUpdateNote,
  onSavingChange,
}: EditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load note values when active note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      
      // Update editor DOM manually to preserve cursor or if selected note changed
      if (editorRef.current) {
        // Only update if text is structurally different to prevent cursor jumps
        if (editorRef.current.innerHTML !== note.content) {
          editorRef.current.innerHTML = note.content;
        }
      }
    } else {
      setTitle('');
      setContent('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
    onSavingChange('idle');
  }, [note?.id]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Debounced auto-save triggers
  const triggerAutoSave = (updatedTitle: string, updatedContent: string) => {
    if (!note) return;

    onSavingChange('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      onUpdateNote(note.id, {
        title: updatedTitle,
        content: updatedContent,
      });
      onSavingChange('saved');
      
      // Change status to idle after a brief showing
      setTimeout(() => {
        onSavingChange('idle');
      }, 1000);
    }, 600);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutoSave(val, content);
  };

  const handleContentInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      triggerAutoSave(title, html);
    }
  };

  // Rich Text command executors
  const executeCommand = (command: string, value: string = '') => {
    if (typeof document !== 'undefined') {
      document.execCommand(command, false, value);
      handleContentInput();
      
      // Refocus editor after toolbar action
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-canvas select-none">
        <div className="max-w-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-canvas-soft-2 border border-hairline flex items-center justify-center mx-auto text-mute">
            <Info size={20} />
          </div>
          <h3 className="text-sm font-semibold text-ink">No note selected.</h3>
          <p className="text-xs text-body">
            Choose an existing study note from the list, or create a new one to begin editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* Dynamic WYSIWYG Formatting Toolbar */}
      <div className="px-4 py-2 border-b border-hairline bg-canvas-soft flex items-center gap-1.5 flex-wrap shrink-0">
        <button
          onClick={() => executeCommand('bold')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Bold text"
        >
          <Bold size={15} />
        </button>
        <button
          onClick={() => executeCommand('italic')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Italic text"
        >
          <Italic size={15} />
        </button>
        <button
          onClick={() => executeCommand('underline')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Underline text"
        >
          <Underline size={15} />
        </button>
        <button
          onClick={() => executeCommand('strikeThrough')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Strikethrough text"
        >
          <Strikethrough size={15} />
        </button>

        <span className="w-px h-5 bg-hairline mx-1" />

        <button
          onClick={() => executeCommand('formatBlock', '<h1>')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Heading 1"
        >
          <Heading1 size={15} />
        </button>
        <button
          onClick={() => executeCommand('formatBlock', '<h2>')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>

        <span className="w-px h-5 bg-hairline mx-1" />

        <button
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Bullet list"
        >
          <List size={15} />
        </button>
        <button
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Numbered list"
        >
          <ListOrdered size={15} />
        </button>
        <button
          onClick={() => executeCommand('formatBlock', '<blockquote>')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Blockquote"
        >
          <Quote size={15} />
        </button>

        <span className="w-px h-5 bg-hairline mx-1" />

        <button
          onClick={() => executeCommand('formatBlock', '<pre>')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Code block"
        >
          <FileCode2 size={15} />
        </button>
        <button
          onClick={() => executeCommand('removeFormat')}
          className="p-1.5 rounded-sm hover:bg-canvas-soft-2 text-body hover:text-ink transition-colors cursor-pointer"
          title="Clear formatting"
        >
          <AlignLeft size={15} />
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 space-y-4">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full text-3xl font-semibold bg-transparent outline-none border-none text-ink tracking-tight placeholder:text-mute"
          placeholder="Untitled Note"
        />

        {/* Contenteditable WYSIWYG Workspace */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentInput}
          className="prose-editor min-h-[400px] text-sm text-ink placeholder:text-mute focus:outline-none"
          data-placeholder="Start typing your study notes here..."
        />
      </div>
    </div>
  );
}
