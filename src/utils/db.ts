import { saveFileContent } from './indexedDB';

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string; // Tailwind class background/border e.g., 'blue', 'purple', 'emerald', 'amber', 'rose', 'indigo'
  icon: string;  // Lucide icon identifier e.g., 'BookOpen', 'Code', 'Calendar', 'Briefcase', 'GraduationCap', 'Award'
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  content: string; // HTML rich text content
  pinned: boolean;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  userId: string;
  subjectId: string;
  name: string;
  type: string;
  size: number;
  favorite: boolean;
  inTrash: boolean;
  createdAt: string;
  deletedAt?: string;
}

const DEFAULT_FILES = (userId: string): FileRecord[] => [
  {
    id: 'file-1',
    userId,
    subjectId: 'sub-1',
    name: 'Astro Guide.pdf',
    type: 'application/pdf',
    size: 1258291, // 1.2 MB
    favorite: true,
    inTrash: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'file-2',
    userId,
    subjectId: 'sub-1',
    name: 'Architecture.png',
    type: 'image/png',
    size: 460800, // 450 KB
    favorite: false,
    inTrash: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'file-3',
    userId,
    subjectId: 'sub-2',
    name: 'Algebra Cheat Sheet.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 2202009, // 2.1 MB
    favorite: false,
    inTrash: false,
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'file-4',
    userId,
    subjectId: 'sub-3',
    name: 'Poem Draft.txt',
    type: 'text/plain',
    size: 12288, // 12 KB
    favorite: true,
    inTrash: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_FILE_DATA: Record<string, string> = {
  'file-1': 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9SZXNvdXJjZXMgPDwKICAgICAgICAvRm9udCA8PCAvRjEgNCAwIFIgPj4KICAgICAgPj4KICAgICAvQ29udGVudHMgNSAwIFIKICA+PgplbmRvYmoKNCAwIG9iagogIDw8IC9UeXBlIC9Gb250CiAgICAgL1N1YnR5cGUgL1R5cGUxCiAgICAgL0Jhc2VGb250IC9IZWx2ZXRpY2EKICA+PgplbmRvYmoKNSAwIG9iagogIDw8IC9MZW5ndGggNDQgPj4Kc3RyZWFtCkJUCiAgL0YxIDI0IFRmCiAgNzAgNzIwIFRkCiAgKFN0dWR5IE5vdGVzIC0gQWNlIHlvdXIgZXhhbXMhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNyAwMDAwMCBuIAowMDAwMDAwMDc5IDAwMDAwIG4gCjAwMDAwMDAxMzkgMDAwMDAgbgowMDAwMDAwMjYwIDAwMDAwIG4gCjAwMDAwMDAzMTkgMDAwMDAgbgogCnRyYWlsZXIKICA8PCAvU2l6ZSA2CiAgICAgL1Jvb3QgMSAwIFIKICA+PgpzdGFydHhyZWYKMzkzCiUlRU9GCg==',
  'file-2': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'file-3': 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQAAAAIAAA=',
  'file-4': 'data:text/plain;base64,VGhpcyBpcyBhIHNlZWRlZCB0ZXh0IGZpbGUgd2l0aCBzb21lIG1vY2sgc3R1ZHkgbm90ZXMgYWJvdXQgbGl0ZXJhcnkgZGV2aWNlcyBhbmQgbmFycmF0aXZlIHZvaWNlLiBLZWVwIHVwIHRoZSBnb29kIHdvcmsh'
};

// Seed Data
const DEFAULT_SUBJECTS = (userId: string): Subject[] => [
  {
    id: 'sub-1',
    userId,
    name: 'Computer Science',
    color: 'violet',
    icon: 'Cpu',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-2',
    userId,
    name: 'Mathematics',
    color: 'link',
    icon: 'Percent',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-3',
    userId,
    name: 'Language Arts',
    color: 'highlight-pink',
    icon: 'Languages',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const DEFAULT_NOTES = (userId: string): Note[] => [
  {
    id: 'note-1',
    userId,
    subjectId: 'sub-1',
    title: 'Astro & Tailwind CSS v4 Notes',
    content: `
      <h2>Quick Reference on Tailwind v4 and Astro</h2>
      <p>Astro + Tailwind CSS v4 offers a highly optimized, compiler-driven styling pipeline. Here are the key configuration takeaways:</p>
      <ul>
        <li><strong>Vite Plugin:</strong> The integration is driven by <code>@tailwindcss/vite</code> in the Vite configuration. No separate PostCSS setup or Tailwind JavaScript configuration file is necessary.</li>
        <li><strong>CSS-First configuration:</strong> Theme extensions are declared inside <code>global.css</code> under the <code>@theme</code> directive using CSS custom properties.</li>
        <li><strong>Utility improvements:</strong> Variants match inline CSS values like <code>bg-red-500!</code> for priority, and class-based dark mode is initialized via <code>@custom-variant dark (&:where(.dark, .dark *));</code>.</li>
      </ul>
      <blockquote>"Tailwind v4 shifts layout configurations closer to standard CSS variables, making theme customizations infinitely cleaner."</blockquote>
    `,
    pinned: true,
    favorite: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-2',
    userId,
    subjectId: 'sub-2',
    title: 'Linear Algebra Theorems',
    content: `
      <h2>Key Vector Space Concepts</h2>
      <p>Essential definitions to remember for exams:</p>
      <ul>
        <li><strong>Span:</strong> The set of all linear combinations of vectors.</li>
        <li><strong>Linear Independence:</strong> A set of vectors is linearly independent if no vector in the set can be written as a linear combination of the others.</li>
        <li><strong>Dimension:</strong> The number of vectors in a basis of the vector space.</li>
      </ul>
      <p>Make sure to review the proofs for the <em>Rank-Nullity Theorem</em> before the weekend study group!</p>
    `,
    pinned: false,
    favorite: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-3',
    userId,
    subjectId: 'sub-3',
    title: 'Narrative Structure & Voice',
    content: `
      <h2>The Three-Act Structure</h2>
      <p>A formula widely used in screenwriting and literature:</p>
      <ol>
        <li><strong>Setup:</strong> Establishing characters, their world, and the inciting incident.</li>
        <li><strong>Confrontation:</strong> The protagonist attempts to resolve the conflict but meets hurdles, leading to a climax.</li>
        <li><strong>Resolution:</strong> The climax settles down, tying up loose plot elements and establishing a new normal.</li>
      </ol>
      <p><em>Focus on showing vs. telling in writing exercises.</em></p>
    `,
    pinned: false,
    favorite: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  }
];

// Helper to check if client-side
const isClient = () => typeof window !== 'undefined';

export const db = {
  // --- USERS SECTION ---
  getUsers(): User[] {
    if (!isClient()) return [];
    const usersStr = localStorage.getItem('study_notes_users');
    return usersStr ? JSON.parse(usersStr) : [];
  },

  saveUsers(users: User[]): void {
    if (!isClient()) return;
    localStorage.setItem('study_notes_users', JSON.stringify(users));
  },

  findUser(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  addUser(name: string, email: string, passwordHash: string): User | null {
    if (this.findUser(email)) return null; // already exists
    const newUser: User = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      passwordHash,
    };
    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);

    // Auto seed data for the new user
    this.seedUserContent(newUser.id);

    return newUser;
  },

  // --- SESSION SECTION ---
  getCurrentUser(): User | null {
    if (!isClient()) return null;
    const sessionUser = localStorage.getItem('study_notes_session');
    return sessionUser ? JSON.parse(sessionUser) : null;
  },

  setCurrentUser(user: User): void {
    if (!isClient()) return;
    localStorage.setItem('study_notes_session', JSON.stringify(user));
  },

  clearCurrentUser(): void {
    if (!isClient()) return;
    localStorage.removeItem('study_notes_session');
  },

  // --- SEED CONTENT ---
  seedUserContent(userId: string): void {
    if (!isClient()) return;
    
    // Seed subjects if empty
    const allSubjects = this.getAllSubjectsRaw();
    const userSubjects = allSubjects.filter(s => s.userId === userId);
    if (userSubjects.length === 0) {
      const seeded = DEFAULT_SUBJECTS(userId);
      localStorage.setItem('study_notes_subjects', JSON.stringify([...allSubjects, ...seeded]));
    }

    // Seed notes if empty
    const allNotes = this.getAllNotesRaw();
    const userNotes = allNotes.filter(n => n.userId === userId);
    if (userNotes.length === 0) {
      const seeded = DEFAULT_NOTES(userId);
      localStorage.setItem('study_notes_notes', JSON.stringify([...allNotes, ...seeded]));
    }

    // Seed files if empty
    const allFiles = this.getAllFilesRaw();
    const userFiles = allFiles.filter(f => f.userId === userId);
    if (userFiles.length === 0) {
      const seededFiles = DEFAULT_FILES(userId);
      localStorage.setItem('study_notes_files', JSON.stringify([...allFiles, ...seededFiles]));
      
      // Async seed file content in IndexedDB
      seededFiles.forEach((file) => {
        const base64 = MOCK_FILE_DATA[file.id];
        if (base64) {
          saveFileContent(file.id, base64).catch(err => {
            console.error('Failed to seed file content for ' + file.name, err);
          });
        }
      });
    }
  },

  // --- SUBJECTS SECTION ---
  getAllSubjectsRaw(): Subject[] {
    if (!isClient()) return [];
    const subjectsStr = localStorage.getItem('study_notes_subjects');
    return subjectsStr ? JSON.parse(subjectsStr) : [];
  },

  getSubjects(userId: string): Subject[] {
    return this.getAllSubjectsRaw().filter(s => s.userId === userId);
  },

  addSubject(userId: string, name: string, color: string, icon: string): Subject {
    const newSubject: Subject = {
      id: 'sub-' + Math.random().toString(36).substr(2, 9),
      userId,
      name,
      color,
      icon,
      createdAt: new Date().toISOString(),
    };
    const subjects = this.getAllSubjectsRaw();
    subjects.push(newSubject);
    localStorage.setItem('study_notes_subjects', JSON.stringify(subjects));
    return newSubject;
  },

  updateSubject(id: string, name: string, color: string, icon: string): Subject | null {
    const subjects = this.getAllSubjectsRaw();
    const idx = subjects.findIndex(s => s.id === id);
    if (idx === -1) return null;

    subjects[idx] = {
      ...subjects[idx],
      name,
      color,
      icon,
    };
    localStorage.setItem('study_notes_subjects', JSON.stringify(subjects));
    return subjects[idx];
  },

  deleteSubject(id: string): boolean {
    const subjects = this.getAllSubjectsRaw();
    const filtered = subjects.filter(s => s.id !== id);
    if (subjects.length === filtered.length) return false;

    localStorage.setItem('study_notes_subjects', JSON.stringify(filtered));

    // Cascade delete associated notes
    const notes = this.getAllNotesRaw();
    const remainingNotes = notes.filter(n => n.subjectId !== id);
    localStorage.setItem('study_notes_notes', JSON.stringify(remainingNotes));

    return true;
  },

  // --- NOTES SECTION ---
  getAllNotesRaw(): Note[] {
    if (!isClient()) return [];
    const notesStr = localStorage.getItem('study_notes_notes');
    return notesStr ? JSON.parse(notesStr) : [];
  },

  getNotes(userId: string): Note[] {
    return this.getAllNotesRaw().filter(n => n.userId === userId);
  },

  addNote(userId: string, subjectId: string, title: string = 'Untitled Note', content: string = ''): Note {
    const newNote: Note = {
      id: 'note-' + Math.random().toString(36).substr(2, 9),
      userId,
      subjectId,
      title,
      content,
      pinned: false,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const notes = this.getAllNotesRaw();
    notes.push(newNote);
    localStorage.setItem('study_notes_notes', JSON.stringify(notes));
    return newNote;
  },

  updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>): Note | null {
    const notes = this.getAllNotesRaw();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return null;

    notes[idx] = {
      ...notes[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('study_notes_notes', JSON.stringify(notes));
    return notes[idx];
  },

  deleteNote(id: string): boolean {
    const notes = this.getAllNotesRaw();
    const filtered = notes.filter(n => n.id !== id);
    if (notes.length === filtered.length) return false;

    localStorage.setItem('study_notes_notes', JSON.stringify(filtered));
    return true;
  },

  // --- FILES SECTION ---
  getAllFilesRaw(): FileRecord[] {
    if (!isClient()) return [];
    const filesStr = localStorage.getItem('study_notes_files');
    return filesStr ? JSON.parse(filesStr) : [];
  },

  getFiles(userId: string): FileRecord[] {
    return this.getAllFilesRaw().filter(f => f.userId === userId);
  },

  addFileMetadata(userId: string, subjectId: string, name: string, type: string, size: number): FileRecord {
    const newFile: FileRecord = {
      id: 'file-' + Math.random().toString(36).substr(2, 9),
      userId,
      subjectId,
      name,
      type,
      size,
      favorite: false,
      inTrash: false,
      createdAt: new Date().toISOString(),
    };
    const files = this.getAllFilesRaw();
    files.push(newFile);
    localStorage.setItem('study_notes_files', JSON.stringify(files));
    return newFile;
  },

  updateFileMetadata(id: string, updates: Partial<Omit<FileRecord, 'id' | 'userId' | 'createdAt'>>): FileRecord | null {
    const files = this.getAllFilesRaw();
    const idx = files.findIndex(f => f.id === id);
    if (idx === -1) return null;

    files[idx] = {
      ...files[idx],
      ...updates,
    };
    localStorage.setItem('study_notes_files', JSON.stringify(files));
    return files[idx];
  },

  deleteFileMetadata(id: string): boolean {
    const files = this.getAllFilesRaw();
    const filtered = files.filter(f => f.id !== id);
    if (files.length === filtered.length) return false;

    localStorage.setItem('study_notes_files', JSON.stringify(filtered));
    return true;
  }
};
