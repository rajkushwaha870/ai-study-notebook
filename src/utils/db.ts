import { supabase } from './supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  content: string;
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

// Default/Seed Data helpers
const DEFAULT_FILES = (userId: string): FileRecord[] => [
  {
    id: 'file-1',
    userId,
    subjectId: 'sub-1',
    name: 'Astro Guide.pdf',
    type: 'application/pdf',
    size: 1258291,
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
    size: 460800,
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
    size: 2202009,
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
    size: 12288,
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

const isClient = () => typeof window !== 'undefined';

async function uploadBase64ToStorage(path: string, base64Data: string, contentType: string): Promise<boolean> {
  try {
    const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    
    const { error } = await supabase.storage.from('uploads').upload(path, blob, {
      contentType,
      upsert: true
    });
    if (error) {
      console.error('Error seeding file to storage:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to convert and upload base64 to storage:', e);
    return false;
  }
}

export const db = {
  // --- USERS SECTION ---
  getCurrentUser(): User | null {
    if (!isClient()) return null;
    const keys = Object.keys(localStorage);
    const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (sbKey) {
      try {
        const sessionData = JSON.parse(localStorage.getItem(sbKey) || '{}');
        const user = sessionData.user;
        if (user) {
          return {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          };
        }
      } catch (e) {
        console.error('Error parsing Supabase session from localStorage:', e);
      }
    }
    return null;
  },

  async saveUserProfile(user: User): Promise<void> {
    try {
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      if (error) {
        console.error('Error saving user profile to Supabase database:', error);
      }
    } catch (err) {
      console.error('Error in saveUserProfile:', err);
    }
  },

  async getCurrentUserAsync(): Promise<User | null> {
    if (!isClient()) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      let resolvedUser: User | null = null;

      if (session?.user) {
        resolvedUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        };
      } else {
        resolvedUser = this.getCurrentUser();
      }

      if (resolvedUser) {
        // Save/Sync authenticated user profile to public.users automatically
        await this.saveUserProfile(resolvedUser);
      }

      return resolvedUser;
    } catch (err) {
      console.error('Error resolving current user session:', err);
      return this.getCurrentUser();
    }
  },

  async clearCurrentUser(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error during signOut:', e);
    } finally {
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        const sbKeys = keys.filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
        sbKeys.forEach(k => {
          try {
            localStorage.removeItem(k);
          } catch (err) {}
        });
      }
    }
  },

  // --- SEED CONTENT ---
  async seedUserContent(userId: string): Promise<void> {
    try {
      // 1. Check if user already has subjects
      const { data: existingSubs, error: subsError } = await supabase
        .from('subjects')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (subsError) {
        console.error('Error checking subjects for seeding:', subsError);
        return;
      }

      if (existingSubs && existingSubs.length > 0) {
        // Already has data, no seeding needed
        return;
      }

      console.log('Seeding default subjects, notes, and files for user: ' + userId);

      // Generate dynamic unique IDs for subjects
      const sub1Id = 'sub-' + Math.random().toString(36).substring(2, 11);
      const sub2Id = 'sub-' + Math.random().toString(36).substring(2, 11);
      const sub3Id = 'sub-' + Math.random().toString(36).substring(2, 11);

      const seededSubs = [
        {
          id: sub1Id,
          user_id: userId,
          name: 'Computer Science',
          color: 'violet',
          icon: 'Cpu',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: sub2Id,
          user_id: userId,
          name: 'Mathematics',
          color: 'link',
          icon: 'Percent',
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: sub3Id,
          user_id: userId,
          name: 'Language Arts',
          color: 'highlight-pink',
          icon: 'Languages',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];

      const { error: insertSubsError } = await supabase
        .from('subjects')
        .insert(seededSubs);

      if (insertSubsError) {
        console.error('Error inserting default subjects:', insertSubsError);
        return;
      }

      // Generate unique IDs for notes
      const note1Id = 'note-' + Math.random().toString(36).substring(2, 11);
      const note2Id = 'note-' + Math.random().toString(36).substring(2, 11);
      const note3Id = 'note-' + Math.random().toString(36).substring(2, 11);

      const seededNotes = [
        {
          id: note1Id,
          user_id: userId,
          subject_id: sub1Id,
          title: 'Astro & Tailwind CSS v4 Notes',
          content: DEFAULT_NOTES(userId)[0].content,
          pinned: true,
          favorite: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: note2Id,
          user_id: userId,
          subject_id: sub2Id,
          title: 'Linear Algebra Theorems',
          content: DEFAULT_NOTES(userId)[1].content,
          pinned: false,
          favorite: false,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: note3Id,
          user_id: userId,
          subject_id: sub3Id,
          title: 'Narrative Structure & Voice',
          content: DEFAULT_NOTES(userId)[2].content,
          pinned: false,
          favorite: true,
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        }
      ];

      const { error: insertNotesError } = await supabase
        .from('notes')
        .insert(seededNotes);

      if (insertNotesError) {
        console.error('Error inserting default notes:', insertNotesError);
      }

      // Generate unique IDs for files
      const file1Id = 'file-' + Math.random().toString(36).substring(2, 11);
      const file2Id = 'file-' + Math.random().toString(36).substring(2, 11);
      const file3Id = 'file-' + Math.random().toString(36).substring(2, 11);
      const file4Id = 'file-' + Math.random().toString(36).substring(2, 11);

      const seededFiles = [
        {
          id: file1Id,
          user_id: userId,
          subject_id: sub1Id,
          name: 'Astro Guide.pdf',
          type: 'application/pdf',
          size: 1258291,
          favorite: true,
          in_trash: false,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: file2Id,
          user_id: userId,
          subject_id: sub1Id,
          name: 'Architecture.png',
          type: 'image/png',
          size: 460800,
          favorite: false,
          in_trash: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: file3Id,
          user_id: userId,
          subject_id: sub2Id,
          name: 'Algebra Cheat Sheet.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 2202009,
          favorite: false,
          in_trash: false,
          created_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: file4Id,
          user_id: userId,
          subject_id: sub3Id,
          name: 'Poem Draft.txt',
          type: 'text/plain',
          size: 12288,
          favorite: true,
          in_trash: false,
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        }
      ];

      const { error: insertFilesError } = await supabase
        .from('files')
        .insert(seededFiles);

      if (insertFilesError) {
        console.error('Error inserting default files metadata:', insertFilesError);
      }

      // Upload mock files to storage
      const fileMappings = [
        { id: file1Id, mockId: 'file-1', type: 'application/pdf', name: 'Astro Guide.pdf' },
        { id: file2Id, mockId: 'file-2', type: 'image/png', name: 'Architecture.png' },
        { id: file3Id, mockId: 'file-3', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Algebra Cheat Sheet.docx' },
        { id: file4Id, mockId: 'file-4', type: 'text/plain', name: 'Poem Draft.txt' }
      ];

      for (const file of fileMappings) {
        const base64 = MOCK_FILE_DATA[file.mockId];
        if (base64) {
          const path = `${userId}/${file.name}`;
          await uploadBase64ToStorage(path, base64, file.type);
        }
      }
      console.log('Seeding completed successfully.');
    } catch (err) {
      console.error('Error seeding user content:', err);
    }
  },

  // --- SUBJECTS SECTION ---
  async getSubjects(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error getting subjects:', error);
      return [];
    }
    return data.map(s => ({
      id: s.id,
      userId: s.user_id,
      name: s.name,
      color: s.color,
      icon: s.icon,
      createdAt: s.created_at,
    }));
  },

  async addSubject(userId: string, name: string, color: string, icon: string): Promise<Subject> {
    const newSubject = {
      id: 'sub-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      name,
      color,
      icon,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('subjects').insert(newSubject);
    if (error) throw error;
    return {
      id: newSubject.id,
      userId: newSubject.user_id,
      name: newSubject.name,
      color: newSubject.color,
      icon: newSubject.icon,
      createdAt: newSubject.created_at,
    };
  },

  async updateSubject(id: string, name: string, color: string, icon: string): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .update({ name, color, icon })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating subject:', error);
      return null;
    }
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      color: data.color,
      icon: data.icon,
      createdAt: data.created_at,
    };
  },

  async deleteSubject(id: string): Promise<boolean> {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) {
      console.error('Error deleting subject:', error);
      return false;
    }
    return true;
  },

  // --- NOTES SECTION ---
  async getNotes(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error getting notes:', error);
      return [];
    }
    return data.map(n => ({
      id: n.id,
      userId: n.user_id,
      subjectId: n.subject_id,
      title: n.title,
      content: n.content,
      pinned: n.pinned,
      favorite: n.favorite,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));
  },

  async addNote(userId: string, subjectId: string, title: string = 'Untitled Note', content: string = ''): Promise<Note> {
    const newNote = {
      id: 'note-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      subject_id: subjectId,
      title,
      content,
      pinned: false,
      favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('notes').insert(newNote);
    if (error) throw error;
    return {
      id: newNote.id,
      userId: newNote.user_id,
      subjectId: newNote.subject_id,
      title: newNote.title,
      content: newNote.content,
      pinned: newNote.pinned,
      favorite: newNote.favorite,
      createdAt: newNote.created_at,
      updatedAt: newNote.updated_at,
    };
  },

  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>): Promise<Note | null> {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.pinned !== undefined) dbUpdates.pinned = updates.pinned;
    if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite;
    if (updates.subjectId !== undefined) dbUpdates.subject_id = updates.subjectId;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('notes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating note:', error);
      return null;
    }
    return {
      id: data.id,
      userId: data.user_id,
      subjectId: data.subject_id,
      title: data.title,
      content: data.content,
      pinned: data.pinned,
      favorite: data.favorite,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async deleteNote(id: string): Promise<boolean> {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }
    return true;
  },

  // --- FILES SECTION ---
  async getFiles(userId: string): Promise<FileRecord[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error getting files:', error);
      return [];
    }
    return data.map(f => ({
      id: f.id,
      userId: f.user_id,
      subjectId: f.subject_id,
      name: f.name,
      type: f.type,
      size: Number(f.size),
      favorite: f.favorite,
      inTrash: f.in_trash,
      createdAt: f.created_at,
      deletedAt: f.deleted_at || undefined,
    }));
  },

  async addFileMetadata(userId: string, subjectId: string, name: string, type: string, size: number): Promise<FileRecord> {
    const newFile = {
      id: 'file-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      subject_id: subjectId,
      name,
      type,
      size,
      favorite: false,
      in_trash: false,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('files').insert(newFile);
    if (error) throw error;
    return {
      id: newFile.id,
      userId: newFile.user_id,
      subjectId: newFile.subject_id,
      name: newFile.name,
      type: newFile.type,
      size: newFile.size,
      favorite: newFile.favorite,
      inTrash: newFile.in_trash,
      createdAt: newFile.created_at,
    };
  },

  async updateFileMetadata(id: string, updates: Partial<Omit<FileRecord, 'id' | 'userId' | 'createdAt'>>): Promise<FileRecord | null> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite;
    if (updates.inTrash !== undefined) dbUpdates.in_trash = updates.inTrash;
    if (updates.deletedAt !== undefined) dbUpdates.deleted_at = updates.deletedAt;
    if (updates.subjectId !== undefined) dbUpdates.subject_id = updates.subjectId;

    const { data, error } = await supabase
      .from('files')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating file metadata:', error);
      return null;
    }
    return {
      id: data.id,
      userId: data.user_id,
      subjectId: data.subject_id,
      name: data.name,
      type: data.type,
      size: Number(data.size),
      favorite: data.favorite,
      inTrash: data.in_trash,
      createdAt: data.created_at,
      deletedAt: data.deleted_at || undefined,
    };
  },

  async deleteFileMetadata(id: string): Promise<boolean> {
    const { error } = await supabase.from('files').delete().eq('id', id);
    if (error) {
      console.error('Error deleting file metadata:', error);
      return false;
    }
    return true;
  },

  // --- STORAGE WRAPPERS ---
  async saveFileContent(userId: string, fileId: string, dataUrl: string, fileType: string): Promise<void> {
    // Fetch file metadata to resolve the actual file name
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('name')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      throw new Error(`File metadata not found for ID: ${fileId}`);
    }

    const base64Content = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });

    const path = `${userId}/${fileData.name}`;
    const { error } = await supabase.storage.from('uploads').upload(path, blob, {
      contentType: fileType,
      upsert: true
    });
    if (error) throw error;
  },

  async getFileContent(userId: string, fileId: string): Promise<string> {
    // Fetch file metadata to resolve the actual file name
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('name')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      throw new Error(`File metadata not found for ID: ${fileId}`);
    }

    const path = `${userId}/${fileData.name}`;
    const { data, error } = await supabase.storage.from('uploads').download(path);
    if (error) throw error;

    return URL.createObjectURL(data);
  },

  async deleteFileContent(userId: string, fileId: string): Promise<void> {
    // Query metadata for the file name before deletion (with fallback)
    const { data: fileData } = await supabase
      .from('files')
      .select('name')
      .eq('id', fileId)
      .maybeSingle();

    const fileName = fileData?.name || fileId;
    const path = `${userId}/${fileName}`;
    const { error } = await supabase.storage.from('uploads').remove([path]);
    if (error) throw error;
  },

  // --- CHAT WRAPPERS ---
  async getChats(userId: string): Promise<any[]> {
    const { data: chats, error } = await supabase
      .from('ai_chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !chats) {
      console.error('Error fetching chats from Supabase:', error);
      return [];
    }

    return chats.map(c => ({
      id: c.id,
      userId: c.user_id,
      title: c.title,
      messages: c.messages || [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  },

  async addChatSession(userId: string, sessionId: string, title: string): Promise<void> {
    const { error } = await supabase.from('ai_chats').insert({
      id: sessionId,
      user_id: userId,
      title: title || 'New Chat',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  async addChatMessage(sessionId: string, msg: any): Promise<void> {
    const { data, error: fetchError } = await supabase
      .from('ai_chats')
      .select('messages')
      .eq('id', sessionId)
      .single();
    if (fetchError) throw fetchError;

    const currentMessages = data?.messages || [];
    const exists = currentMessages.some((m: any) => m.id === msg.id);
    const newMessages = exists
      ? currentMessages.map((m: any) => m.id === msg.id ? msg : m)
      : [...currentMessages, msg];

    const { error } = await supabase
      .from('ai_chats')
      .update({
        messages: newMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
    if (error) throw error;
  },

  async updateChatSessionTitle(sessionId: string, title: string): Promise<void> {
    const { error } = await supabase.from('ai_chats')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', sessionId);
    if (error) throw error;
  },

  async deleteChatSession(sessionId: string): Promise<void> {
    const { error } = await supabase.from('ai_chats').delete().eq('id', sessionId);
    if (error) throw error;
  },

  async truncateChatHistory(chatId: string, keptMessages: any[]): Promise<void> {
    const { error } = await supabase
      .from('ai_chats')
      .update({
        messages: keptMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId);
    if (error) throw error;
  }
};
