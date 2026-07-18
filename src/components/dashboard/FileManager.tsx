import React, { useState, useRef } from 'react';
import { 
  Upload, Search, File as FileIcon, FolderOpen, 
  HardDrive, RefreshCw, AlertCircle 
} from 'lucide-react';
import type { FileRecord, Subject } from '../../utils/db';
import FileCard from './FileCard';

interface FileManagerProps {
  files: FileRecord[];
  activeSubject: Subject | null;
  activeFilter: string | null;
  onUploadFiles: (files: FileList) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onRestoreFile?: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onPreviewFile: (file: FileRecord) => void;
  onDownloadFile: (file: FileRecord) => void;
  isUploading?: boolean;
}

export default function FileManager({
  files,
  activeSubject,
  activeFilter,
  onUploadFiles,
  onToggleFavorite,
  onDeleteFile,
  onRestoreFile,
  onRenameFile,
  onPreviewFile,
  onDownloadFile,
  isUploading = false,
}: FileManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'image' | 'doc'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!activeFilter || activeFilter !== 'trash') {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Do not allow uploads in trash
    if (activeFilter === 'trash') return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    if (activeFilter !== 'trash') {
      fileInputRef.current?.click();
    }
  };

  // Size calculation helper
  const getStorageUsedText = () => {
    const baseBytes = 2.3 * 1024 * 1024 * 1024; // Mock base 2.3 GB
    const uploadedBytes = files.filter(f => !f.inTrash).reduce((sum, f) => sum + f.size, 0);
    const totalBytes = baseBytes + uploadedBytes;
    
    const gb = totalBytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const getStoragePercentage = () => {
    const baseBytes = 2.3 * 1024 * 1024 * 1024;
    const uploadedBytes = files.filter(f => !f.inTrash).reduce((sum, f) => sum + f.size, 0);
    const totalBytes = baseBytes + uploadedBytes;
    const maxBytes = 10 * 1024 * 1024 * 1024; // 10 GB limit
    
    return Math.min((totalBytes / maxBytes) * 100, 100);
  };

  // Filter logic
  const filteredFiles = files.filter((file) => {
    // 1. Search text filter
    if (searchQuery.trim() && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 2. Type filter
    if (typeFilter === 'pdf' && !file.type.toLowerCase().includes('pdf')) {
      return false;
    }
    if (typeFilter === 'image' && !file.type.toLowerCase().includes('image')) {
      return false;
    }
    if (typeFilter === 'doc') {
      const isDoc = file.type.includes('word') || file.type.includes('document') || file.type.includes('presentation') || file.type.includes('plain');
      if (!isDoc) return false;
    }

    return true;
  });

  // Get current section label
  const getSectionTitle = () => {
    if (activeSubject) return `${activeSubject.name} Files`;
    if (activeFilter === 'recent-files') return 'Recent Files';
    if (activeFilter === 'favorites') return 'Favorite Files';
    if (activeFilter === 'trash') return 'Trash / Deleted Files';
    return 'All Uploaded Files';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-y-auto select-none p-6 sm:p-8 space-y-6">
      {/* Top Title & Storage Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            {getSectionTitle()}
          </h2>
          <p className="text-xs text-mute font-mono mt-1">
            Displaying {filteredFiles.length} files of {files.length} total
          </p>
        </div>

        {/* Storage Bar (Stark aesthetic) */}
        <div className="w-full md:w-64 bg-canvas border border-hairline rounded-md p-3.5 shadow-level-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-mute mb-2">
            <span className="flex items-center gap-1">
              <HardDrive size={11} />
              Storage Used
            </span>
            <span className="text-ink font-semibold">{getStorageUsedText()} / 10 GB</span>
          </div>
          <div className="w-full h-1.5 bg-canvas-soft-2 border border-hairline rounded-full overflow-hidden">
            <div 
              style={{ width: `${getStoragePercentage()}%` }}
              className="h-full bg-primary transition-all duration-500 ease-out"
            />
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone (hidden in trash view) */}
      {activeFilter !== 'trash' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`group border border-dashed rounded-md p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center min-h-[140px] ${
            isDragging 
              ? 'border-primary bg-canvas-soft-2/60 scale-[1.005] shadow-level-2' 
              : 'border-hairline hover:border-hairline-strong bg-canvas-soft hover:bg-canvas-soft-2/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.docx,.ppt,.pptx,.txt,.md,.csv,.xlsx,image/*"
          />

          {isUploading ? (
            <div className="space-y-2 flex flex-col items-center">
              <RefreshCw size={24} className="text-primary animate-spin" />
              <p className="text-xs font-semibold text-ink">Uploading file content...</p>
              <p className="text-[10px] text-mute font-mono">Writing byte data directly into localized IndexedDB</p>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center">
              <div className="p-3 bg-canvas border border-hairline rounded-full text-mute group-hover:text-ink group-hover:scale-105 active:scale-95 transition-all shadow-level-1">
                <Upload size={18} />
              </div>
              <h4 className="text-xs font-semibold text-ink">
                Drag & drop files here, or click to upload
              </h4>
              <p className="text-[10px] text-mute font-mono max-w-sm leading-relaxed">
                Supports PDF, Images, DOCX, PPTX, TXT, Markdown, CSV, XLSX. Files will bind automatically to the selected subject.
              </p>
            </div>
          )}

          {/* Dotted border highlight on hover */}
          <div className="absolute inset-0 bg-primary/0 pointer-events-none group-hover:bg-primary/[0.005] transition-colors" />
        </div>
      )}

      {/* Toolbar filters: Search + Type Category Chips */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-canvas-soft border border-hairline rounded-md p-3">
        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-mute" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-canvas border border-hairline rounded-sm py-1.5 pl-8 pr-3 text-xs text-ink focus:outline-none focus:border-hairline-strong placeholder:text-mute h-[32px]"
            placeholder="Search inside folder..."
          />
        </div>

        {/* Tab category filters */}
        <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto overflow-x-auto">
          {(['all', 'pdf', 'image', 'doc'] as const).map((filter) => {
            const labels = { all: 'All Types', pdf: 'PDFs', image: 'Images', doc: 'Documents' };
            const isActive = typeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={`px-3 py-1 text-[10px] font-mono rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary text-on-primary border-primary shadow-level-1 font-semibold' 
                    : 'bg-canvas hover:bg-canvas-soft border-hairline text-body hover:text-ink'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trash Alert Warning banner (only in Trash) */}
      {activeFilter === 'trash' && files.length > 0 && (
        <div className="p-3 bg-error-soft/30 border border-error-soft text-error-deep rounded-sm flex items-center gap-2.5 text-xs">
          <AlertCircle size={14} className="shrink-0" />
          <p className="leading-snug">
            Files in the Trash will remain stored locally until permanently deleted. Permanent deletion purges binary data from the device.
          </p>
        </div>
      )}

      {/* Grid of File Cards */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDeleteFile}
              onRestore={onRestoreFile}
              onRename={onRenameFile}
              onPreview={onPreviewFile}
              onDownload={onDownloadFile}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-hairline rounded-md bg-canvas-soft/30 min-h-[220px]">
          {activeFilter === 'trash' ? (
            <>
              <HardDrive size={36} className="text-mute/40 stroke-[1.5] mb-2" />
              <h4 className="text-xs font-semibold text-ink">Trash is empty</h4>
              <p className="text-[10px] text-mute font-mono max-w-xs mt-1">
                Deleted files go here, allowing you to restore them later or remove them forever.
              </p>
            </>
          ) : (
            <>
              <FolderOpen size={36} className="text-mute/40 stroke-[1.5] mb-2" />
              <h4 className="text-xs font-semibold text-ink">No files found</h4>
              {searchQuery.trim() ? (
                <p className="text-[10px] text-mute font-mono max-w-xs mt-1">
                  We couldn't find any files matching "{searchQuery}". Try updating filters.
                </p>
              ) : (
                <p className="text-[10px] text-mute font-mono max-w-xs mt-1 leading-relaxed">
                  Upload PDF, Word, PowerPoint, Text documents, or Images. Drag and drop them directly above to start studying!
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
