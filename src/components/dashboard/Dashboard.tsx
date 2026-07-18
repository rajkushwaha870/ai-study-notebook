import React, { useState, useEffect } from 'react';
import { db } from '../../utils/db';
import type { User, Subject, Note, FileRecord } from '../../utils/db';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import NoteList from './NoteList';
import Editor from './Editor';
import SubjectModal from './SubjectModal';
import SearchModal from './SearchModal';
import FileManager from './FileManager';
import ImageViewer from './ImageViewer';
import PdfViewer from './PdfViewer';
import TextViewer from './TextViewer';
// saveFileContent, getFileContent, deleteFileContent migrated to db
import { ArrowLeft } from 'lucide-react';

export default function Dashboard() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // App core state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  
  // Selections
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'files'>('notes');

  // Status & Modals
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedEditSubject, setSelectedEditSubject] = useState<Subject | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Active File Viewer state
  const [activeViewer, setActiveViewer] = useState<'none' | 'image' | 'pdf' | 'text'>('none');
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');

  // Check auth on mount
  useEffect(() => {
    const initDashboard = async () => {
      const user = await db.getCurrentUserAsync();
      if (!user) {
        window.location.href = '/login';
      } else {
        setCurrentUser(user);
        // Seed content if first time
        await db.seedUserContent(user.id);
        // Fetch subjects, notes, files
        const [subs, nts, fls] = await Promise.all([
          db.getSubjects(user.id),
          db.getNotes(user.id),
          db.getFiles(user.id),
      ]);
        setSubjects(subs);
        setNotes(nts);
        setFiles(fls);

        // Parse query params for filters/subjects
        const params = new URLSearchParams(window.location.search);
        const filterParam = params.get('filter');
        const subjectParam = params.get('subject');
        
        if (subjectParam) {
          setActiveSubjectId(subjectParam);
          setActiveFilter('all');
          setActiveTab('notes');
        } else if (filterParam) {
          setActiveFilter(filterParam);
          setActiveSubjectId(null);
          if (filterParam === 'all-files' || filterParam === 'recent-files' || filterParam === 'trash') {
            setActiveTab('files');
          } else {
            setActiveTab('notes');
          }
        }

        setAuthChecked(true);
      }
    };
    initDashboard();
  }, []);

  // Fetch items helper
  const refreshData = async () => {
    if (currentUser) {
      const [subs, nts, fls] = await Promise.all([
        db.getSubjects(currentUser.id),
        db.getNotes(currentUser.id),
        db.getFiles(currentUser.id),
      ]);
      setSubjects(subs);
      setNotes(nts);
      setFiles(fls);
    }
  };

  // Sync state if notes/subjects deletion happened
  useEffect(() => {
    const syncSelections = async () => {
      if (currentUser) {
        const currentSubjects = await db.getSubjects(currentUser.id);
        // Verify active subject exists
        if (activeSubjectId && !currentSubjects.find(s => s.id === activeSubjectId)) {
          setActiveSubjectId(null);
        }
        
        const currentNotes = await db.getNotes(currentUser.id);
        // Verify active note exists
        if (activeNoteId && !currentNotes.find(n => n.id === activeNoteId)) {
          setActiveNoteId(null);
        }
      }
    };
    syncSelections();
  }, [notes, subjects]);

  if (!authChecked || !currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas-soft font-mono text-xs text-mute">
        Authenticating workspace...
      </div>
    );
  }

  // Filtered notes list based on sidebar selections
  const filteredNotes = notes.filter((note) => {
    if (activeSubjectId) {
      return note.subjectId === activeSubjectId;
    }
    if (activeFilter === 'favorites') {
      return note.favorite;
    }
    if (activeFilter === 'pinned') {
      return note.pinned;
    }
    return true; // 'all'
  });

  // Filtered files list based on selections
  const filteredFiles = files.filter((file) => {
    // 1. If subject is active, only show non-trash files in that subject
    if (activeSubjectId) {
      return file.subjectId === activeSubjectId && !file.inTrash;
    }
    // 2. If viewing trash, show inTrash files only
    if (activeFilter === 'trash') {
      return file.inTrash;
    }
    // 3. Otherwise (in all-files/recent/favorites), filter out trashed files
    if (file.inTrash) {
      return false;
    }
    if (activeFilter === 'favorites') {
      return file.favorite;
    }
    // 'all-files' or 'recent-files' returns true (sorted in render/helper)
    return true;
  });

  // Sort files: recents show sorted by date, otherwise by date descending is standard anyway
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || null;
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // Action handlers
  const handleSelectSubject = (id: string | null) => {
    setActiveSubjectId(id);
    setActiveFilter('all');
    setActiveNoteId(null);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectFilter = (filter: string) => {
    setActiveFilter(filter);
    setActiveSubjectId(null);
    setActiveNoteId(null);
    
    // Auto toggle tab depending on filter source
    if (filter === 'all-files' || filter === 'recent-files' || filter === 'trash') {
      setActiveTab('files');
    } else {
      setActiveTab('notes');
    }
    setIsMobileSidebarOpen(false);
  };

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
  };

  const handleAddNote = async () => {
    // Determine subject to bind to
    let subId = activeSubjectId;
    if (!subId) {
      if (subjects.length > 0) {
        subId = subjects[0].id;
      } else {
        // Must create subject first
        setIsSubjectModalOpen(true);
        return;
      }
    }

    try {
      const newNote = await db.addNote(currentUser.id, subId, 'Untitled Note', '');
      await refreshData();
      setActiveNoteId(newNote.id);
    } catch (err) {
      console.error('Failed to add note', err);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    // Update local state list directly to prevent full re-fetching lag
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note))
    );
    try {
      await db.updateNote(id, updates);
    } catch (err) {
      console.error('Failed to update note', err);
    }
  };

  const handleDeleteNote = async () => {
    if (activeNoteId) {
      if (confirm('Are you sure you want to delete this note?')) {
        try {
          await db.deleteNote(activeNoteId);
          setActiveNoteId(null);
          await refreshData();
        } catch (err) {
          console.error('Failed to delete note', err);
        }
      }
    }
  };

  const handleTogglePin = () => {
    if (activeNote) {
      handleUpdateNote(activeNote.id, { pinned: !activeNote.pinned });
    }
  };

  const handleToggleFavorite = () => {
    if (activeNote) {
      handleUpdateNote(activeNote.id, { favorite: !activeNote.favorite });
    }
  };

  const handleLogout = async () => {
    const shouldBypass = typeof window !== 'undefined' && window.location.search.includes('bypass_confirm=true');
    if (shouldBypass || confirm('Are you sure you want to logout?')) {
      await db.clearCurrentUser();
      window.location.href = '/login';
    }
  };

  const handleOpenAddSubject = () => {
    setSelectedEditSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setSelectedEditSubject(sub);
    setIsSubjectModalOpen(true);
  };

  // --- FILE MANAGEMENT HANDLERS ---
  const handleUploadFiles = async (fileList: FileList) => {
    if (!currentUser) return;
    
    // Choose active subject or fallback to first subject
    let targetSubjectId = activeSubjectId;
    if (!targetSubjectId) {
      if (subjects.length > 0) {
        targetSubjectId = subjects[0].id;
      } else {
        alert('Please create a subject first before uploading files.');
        setIsSubjectModalOpen(true);
        return;
      }
    }

    setIsUploadingFile(true);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Convert file to Data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        // 1. Create file record in database
        const newFile = await db.addFileMetadata(
          currentUser.id,
          targetSubjectId,
          file.name,
          file.type || 'application/octet-stream',
          file.size
        );

        // 2. Save binary data URL in Supabase Storage
        await db.saveFileContent(currentUser.id, newFile.id, dataUrl, file.type || 'application/octet-stream');
      }
      
      await refreshData();
    } catch (err) {
      console.error('File upload failed', err);
      alert('An error occurred during file upload.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleToggleFileFavorite = async (id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      await db.updateFileMetadata(id, { favorite: !file.favorite });
      await refreshData();
    }
  };

  const handleDeleteFile = async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    if (!file.inTrash) {
      // Move to trash
      await db.updateFileMetadata(id, { inTrash: true, deletedAt: new Date().toISOString() });
      await refreshData();
    } else {
      // Permanent delete
      if (confirm(`Are you sure you want to permanently delete "${file.name}"? This action cannot be undone.`)) {
        await db.deleteFileContent(currentUser.id, id);
        await db.deleteFileMetadata(id);
        await refreshData();
      }
    }
  };

  const handleRestoreFile = async (id: string) => {
    await db.updateFileMetadata(id, { inTrash: false, deletedAt: undefined });
    await refreshData();
  };

  const handleRenameFile = async (id: string, newName: string) => {
    await db.updateFileMetadata(id, { name: newName });
    await refreshData();
  };

  const handlePreviewFile = async (file: FileRecord) => {
    try {
      const content = await db.getFileContent(currentUser.id, file.id);
      if (!content) {
        alert('File content URL not found.');
        return;
      }

      setPreviewFile(file);
      setPreviewContent(content);

      const type = file.type.toLowerCase();
      if (type.includes('pdf')) {
        setActiveViewer('pdf');
      } else if (type.includes('image')) {
        setActiveViewer('image');
      } else if (
        type.includes('plain') || 
        type.includes('text') || 
        type.includes('markdown') || 
        type.includes('csv') || 
        file.name.endsWith('.md') || 
        file.name.endsWith('.csv')
      ) {
        setActiveViewer('text');
      } else {
        // Fallback for docx / pptx / xlsx: download directly since they are binary office documents
        handleDownloadFile(file);
      }
    } catch (err) {
      console.error('Failed to preview file', err);
    }
  };

  const handleDownloadFile = async (file: FileRecord) => {
    try {
      const content = await db.getFileContent(currentUser.id, file.id);
      if (!content) {
        alert('File content URL not found.');
        return;
      }
      
      const link = document.createElement('a');
      if (content.startsWith('http://') || content.startsWith('https://')) {
        const response = await fetch(content);
        const blob = await response.blob();
        const localUrl = URL.createObjectURL(blob);
        link.href = localUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(localUrl);
      } else {
        link.href = content;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Failed to download file', err);
    }
  };

  const handleSelectFileFromSearch = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setActiveSubjectId(file.subjectId);
      setActiveFilter('all-files');
      setActiveTab('files');
      handlePreviewFile(file);
    }
  };

  // ImageViewer Prev/Next Image Navigation
  const imageFiles = sortedFiles.filter(f => f.type.toLowerCase().includes('image'));
  const currentImageIdx = previewFile ? imageFiles.findIndex(f => f.id === previewFile.id) : -1;
  const hasPrevImage = currentImageIdx > 0;
  const hasNextImage = currentImageIdx >= 0 && currentImageIdx < imageFiles.length - 1;

  const handlePrevImage = () => {
    if (hasPrevImage) {
      handlePreviewFile(imageFiles[currentImageIdx - 1]);
    }
  };

  const handleNextImage = () => {
    if (hasNextImage) {
      handlePreviewFile(imageFiles[currentImageIdx + 1]);
    }
  };

  if (!authChecked || !currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas-soft">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-canvas-soft text-ink overflow-hidden select-none">
      {/* Dynamic responsive Sidebar */}
      <Sidebar
        user={currentUser}
        subjects={subjects}
        activeSubjectId={activeSubjectId}
        activeFilter={activeFilter}
        onSelectSubject={handleSelectSubject}
        onSelectFilter={handleSelectFilter}
        onAddSubject={handleOpenAddSubject}
        onEditSubject={handleOpenEditSubject}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onToggleMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navbar */}
        <TopNav
          activeSubject={activeSubject}
          activeNote={activeNote}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onTriggerSearch={() => setIsSearchModalOpen(true)}
          onTogglePin={handleTogglePin}
          onToggleFavorite={handleToggleFavorite}
          onDeleteNote={handleDeleteNote}
          savingStatus={savingStatus}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Dynamic Multi-Pane Content Layout */}
        <div className="flex-1 flex min-w-0 min-h-0 relative">
          
          {/* FILES MANAGER VIEW (Unified Spacious Layout) */}
          {activeTab === 'files' ? (
            <FileManager
              files={sortedFiles}
              activeSubject={activeSubject}
              activeFilter={activeFilter}
              onUploadFiles={handleUploadFiles}
              onToggleFavorite={handleToggleFileFavorite}
              onDeleteFile={handleDeleteFile}
              onRestoreFile={handleRestoreFile}
              onRenameFile={handleRenameFile}
              onPreviewFile={handlePreviewFile}
              onDownloadFile={handleDownloadFile}
              isUploading={isUploadingFile}
            />
          ) : (
            /* NOTES DUAL-PANE VIEW */
            <>
              {/* Desktop Dual-Pane (NoteList + Editor) */}
              <div className="hidden sm:flex flex-row w-full h-full min-w-0">
                <NoteList
                  notes={filteredNotes}
                  subjects={subjects}
                  activeNoteId={activeNoteId}
                  onSelectNote={handleSelectNote}
                  onAddNote={handleAddNote}
                  activeSubjectId={activeSubjectId}
                />
                <Editor
                  note={activeNote}
                  onUpdateNote={handleUpdateNote}
                  onSavingChange={setSavingStatus}
                />
              </div>

              {/* Mobile Single-Pane Responsive Toggling */}
              <div className="flex sm:hidden w-full h-full min-w-0 relative">
                {activeNoteId ? (
                  // Editor view active on mobile
                  <div className="flex-1 flex flex-col min-w-0 h-full relative">
                    {/* Back button to list */}
                    <div className="px-4 py-2 border-b border-hairline bg-canvas-soft-2 flex items-center shrink-0">
                      <button
                        onClick={() => setActiveNoteId(null)}
                        className="flex items-center gap-1 text-xs text-body hover:text-ink cursor-pointer"
                      >
                        <ArrowLeft size={14} />
                        Back to list
                      </button>
                    </div>
                    <div className="flex-1 min-h-0 min-w-0">
                      <Editor
                        note={activeNote}
                        onUpdateNote={handleUpdateNote}
                        onSavingChange={setSavingStatus}
                      />
                    </div>
                  </div>
                ) : (
                  // NoteList view active on mobile
                  <div className="w-full h-full">
                    <NoteList
                      notes={filteredNotes}
                      subjects={subjects}
                      activeNoteId={activeNoteId}
                      onSelectNote={handleSelectNote}
                      onAddNote={handleAddNote}
                      activeSubjectId={activeSubjectId}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subject CRUD overlay modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSave={refreshData}
        userId={currentUser.id}
        editSubject={selectedEditSubject}
      />

      {/* Global Cmd+K Search modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        notes={notes}
        subjects={subjects}
        files={files}
        onSelectNote={handleSelectNote}
        onSelectSubject={handleSelectSubject}
        onSelectFile={handleSelectFileFromSearch}
      />

      {/* Fullscreen Image Viewer Overlay */}
      <ImageViewer
        isOpen={activeViewer === 'image'}
        onClose={() => { setActiveViewer('none'); setPreviewFile(null); }}
        fileName={previewFile?.name || ''}
        dataUrl={previewContent}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
        hasPrev={hasPrevImage}
        hasNext={hasNextImage}
      />

      {/* Embedded PDF Viewer Modal */}
      <PdfViewer
        isOpen={activeViewer === 'pdf'}
        onClose={() => { setActiveViewer('none'); setPreviewFile(null); }}
        fileName={previewFile?.name || ''}
        dataUrl={previewContent}
      />

      {/* Plain Text File Viewer */}
      <TextViewer
        isOpen={activeViewer === 'text'}
        onClose={() => { setActiveViewer('none'); setPreviewFile(null); }}
        fileName={previewFile?.name || ''}
        dataUrl={previewContent}
      />
    </div>
  );
}
