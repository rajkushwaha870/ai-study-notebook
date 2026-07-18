import React, { useState, useEffect } from 'react';
import { X, Cpu, Percent, Languages, GraduationCap, Award, BookOpen, Calendar, Lightbulb, Trash2 } from 'lucide-react';
import { db } from '../../utils/db';
import type { Subject } from '../../utils/db';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  userId: string;
  editSubject?: Subject | null;
}

const PRESET_COLORS = [
  { name: 'Blue', value: 'link', class: 'bg-[#0070f3] text-white border-[#0070f3]' },
  { name: 'Purple', value: 'violet', class: 'bg-[#7928ca] text-white border-[#7928ca]' },
  { name: 'Pink', value: 'highlight-pink', class: 'bg-[#ff0080] text-white border-[#ff0080]' },
  { name: 'Emerald', value: 'cyan-deep', class: 'bg-[#29bc9b] text-white border-[#29bc9b]' },
  { name: 'Amber', value: 'warning', class: 'bg-[#f5a623] text-white border-[#f5a623]' },
  { name: 'Red', value: 'error', class: 'bg-[#ee0000] text-white border-[#ee0000]' },
];

const PRESET_ICONS = [
  { name: 'Cpu', component: Cpu },
  { name: 'Percent', component: Percent },
  { name: 'Languages', component: Languages },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Award', component: Award },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Calendar', component: Calendar },
  { name: 'Lightbulb', component: Lightbulb },
];

export default function SubjectModal({
  isOpen,
  onClose,
  onSave,
  userId,
  editSubject = null,
}: SubjectModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('link');
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editSubject) {
      setName(editSubject.name);
      setSelectedColor(editSubject.color);
      setSelectedIcon(editSubject.icon);
    } else {
      setName('');
      setSelectedColor('link');
      setSelectedIcon('BookOpen');
    }
    setError('');
  }, [editSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a subject name.');
      return;
    }

    try {
      if (editSubject) {
        await db.updateSubject(editSubject.id, name.trim(), selectedColor, selectedIcon);
      } else {
        await db.addSubject(userId, name.trim(), selectedColor, selectedIcon);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject.');
    }
  };

  const handleDelete = async () => {
    if (editSubject) {
      if (confirm(`Are you sure you want to delete "${editSubject.name}"? This will delete all notes in this subject.`)) {
        try {
          await db.deleteSubject(editSubject.id);
          onSave();
          onClose();
        } catch (err: any) {
          setError(err.message || 'Failed to delete subject.');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fade-in p-4">
      <div 
        className="w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-level-5 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-soft">
          <h3 className="text-sm font-mono uppercase tracking-wider text-ink font-semibold">
            {editSubject ? 'Edit Subject.' : 'Create Subject.'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-canvas-soft-2 rounded-full text-mute hover:text-ink transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-xs bg-error-soft text-error-deep rounded-sm border border-error-soft font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-mute mb-2">
              Subject Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-hairline rounded-sm text-sm text-ink focus:outline-none focus:border-hairline-strong transition-all h-[40px]"
              placeholder="e.g., Organic Chemistry"
              maxLength={30}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-mute mb-2">
              Accent Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full aspect-square rounded-sm border flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    color.class
                  } ${
                    selectedColor === color.value
                      ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-canvas'
                      : 'opacity-70 border-transparent'
                  }`}
                  title={color.name}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white block" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-mute mb-2">
              Icon symbol
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_ICONS.map((icon) => {
                const IconComponent = icon.component;
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setSelectedIcon(icon.name)}
                    className={`p-2 rounded-sm border flex items-center justify-center transition-all cursor-pointer hover:bg-canvas-soft-2 ${
                      selectedIcon === icon.name
                        ? 'border-hairline-strong bg-canvas-soft text-ink font-semibold'
                        : 'border-hairline text-mute'
                    }`}
                    title={icon.name}
                  >
                    <IconComponent size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            {editSubject ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-error-deep hover:bg-error-soft rounded-sm transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs border border-hairline rounded-full hover:bg-canvas-soft-2 text-body transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
