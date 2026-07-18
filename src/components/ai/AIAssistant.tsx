import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../dashboard/Sidebar';
import TopNav from '../dashboard/TopNav';
import { useChat } from '../../hooks/useChat';
import { db, type Subject } from '../../utils/db';
import { renderMarkdown } from '../../utils/markdown';
import { 
  Plus, Search, Trash2, Edit3, Check, Copy, RotateCcw, 
  Square, Send, Paperclip, FileText, X, Bot, Sparkles, AlertCircle
} from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

function AIAssistant() {
  const {
    currentUser,
    authChecked,
    chats,
    activeChatId,
    activeChat,
    selectedAttachments,
    isGenerating,
    error,
    setError,
    newChat,
    sendMessage,
    regenerateResponse,
    stopGenerating,
    renameChat,
    deleteChat,
    toggleAttachment,
    setActiveChatId
  } = useChat();

  // Navigation & Workspace states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // App resource context
  const [availableNotes, setAvailableNotes] = useState<any[]>([]);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Chat search & rename states
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // UI inputs
  const [promptInput, setPromptInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const attachmentMenuRef = useRef<HTMLDivElement | null>(null);

  // Load sidebar data and available files/notes
  useEffect(() => {
    if (!currentUser) return;

    let active = true;

    const loadData = async () => {
      try {
        const [subs, notes, files] = await Promise.all([
          db.getSubjects(currentUser.id),
          db.getNotes(currentUser.id),
          db.getFiles(currentUser.id)
        ]);

        if (active) {
          setSubjects(subs);
          setAvailableNotes(notes);
          setAvailableFiles(files.filter(f => f.type === 'application/pdf' && !f.inTrash));
        }
      } catch (err: any) {
        console.error('Failed to load sidebar data:', err);
        if (active) {
          setError(err.message || 'Failed to load study notes or files from database.');
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [currentUser]);

  // Click outside handler for attachment menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setIsAttachmentMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isGenerating]);

  // Filtered chats based on sidebar search input
  const filteredChats = chats.filter(chat => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    if (chat.title.toLowerCase().includes(q)) return true;
    return chat.messages.some(m => m.content.toLowerCase().includes(q));
  });

  const handleSend = () => {
    if (!promptInput.trim()) return;
    sendMessage(promptInput);
    setPromptInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRenameStart = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setEditingTitle(currentTitle);
  };

  const handleRenameSave = (id: string) => {
    renameChat(id, editingTitle);
    setEditingSessionId(null);
  };

  const handleLogout = () => {
    db.clearCurrentUser();
    window.location.href = '/login';
  };

  if (!authChecked || !currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas-soft font-mono text-xs text-mute">
        Authenticating workspace...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-canvas overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar
        user={currentUser}
        subjects={subjects}
        activeSubjectId={null}
        activeFilter=""
        onSelectSubject={(id) => {
          if (id) window.location.href = `/dashboard?subject=${id}`;
        }}
        onSelectFilter={(filter) => {
          window.location.href = `/dashboard?filter=${filter}`;
        }}
        onAddSubject={() => {
          window.location.href = '/dashboard';
        }}
        onEditSubject={() => {
          window.location.href = '/dashboard';
        }}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onToggleMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-canvas-soft">
        <TopNav
          activeSubject={null}
          activeNote={null}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onTriggerSearch={() => {
            window.location.href = '/dashboard';
          }}
          onTogglePin={() => {}}
          onToggleFavorite={() => {}}
          onDeleteNote={() => {}}
          savingStatus="idle"
          activeTab="notes"
          onTabChange={() => {
            window.location.href = '/dashboard';
          }}
        />

        {/* ChatGPT Style Split Interface */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Chat History Sidebar (ChatGPT style) */}
          <div className="hidden lg:flex w-64 border-r border-hairline bg-canvas flex-col shrink-0 select-none">
            {/* New Chat & Actions */}
            <div className="p-3 border-b border-hairline bg-canvas-soft flex items-center gap-2">
              <button
                onClick={newChat}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-canvas hover:bg-canvas-soft-2 text-ink border border-hairline rounded-sm transition-colors text-xs font-semibold shadow-level-1 cursor-pointer h-9"
              >
                <Plus size={14} />
                New Chat
              </button>
            </div>

            {/* Chat Search */}
            <div className="p-3 border-b border-hairline relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full h-8 pl-8 pr-3 bg-canvas border border-hairline rounded-sm text-xs font-medium text-ink focus:outline-none focus:border-hairline-strong transition-colors"
              />
              <Search size={14} className="absolute left-6 top-5 text-mute" />
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setError(null);
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-all cursor-pointer border ${
                    activeChatId === chat.id
                      ? 'bg-canvas-soft border-hairline text-ink font-semibold shadow-level-1'
                      : 'hover:bg-canvas-soft-2 border-transparent text-body hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full pr-10">
                    <Sparkles size={14} className={`shrink-0 ${activeChatId === chat.id ? 'text-violet animate-pulse' : 'text-mute'}`} />
                    {editingSessionId === chat.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleRenameSave(chat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSave(chat.id);
                        }}
                        autoFocus
                        className="bg-canvas border border-hairline rounded-xs px-1 text-[11px] font-medium text-ink focus:outline-none w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{chat.title}</span>
                    )}
                  </div>

                  {/* Actions inside chat item */}
                  {editingSessionId !== chat.id && (
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-gradient-to-l from-canvas-soft-2 via-canvas-soft-2 pl-3">
                      <button
                        onClick={(e) => handleRenameStart(chat.id, chat.title, e)}
                        className="p-1 hover:bg-canvas text-mute hover:text-ink rounded-xs transition-colors cursor-pointer"
                        title="Rename chat"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="p-1 hover:bg-error-soft text-mute hover:text-error-deep rounded-xs transition-colors cursor-pointer"
                        title="Delete chat"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredChats.length === 0 && (
                <div className="p-4 text-center text-xs text-mute font-mono">
                  No chats found
                </div>
              )}
            </div>
          </div>

          {/* Active Chat Conversation Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full bg-canvas-soft relative">
            <div className="mesh-gradient-container opacity-5"></div>

            {/* Chats header on mobile / small screens */}
            <div className="lg:hidden p-3 border-b border-hairline bg-canvas flex items-center justify-between shrink-0 select-none z-10">
              <button
                onClick={newChat}
                className="flex items-center gap-1 px-3 py-1.5 bg-canvas hover:bg-canvas-soft-2 text-ink border border-hairline rounded-sm transition-colors text-xs font-semibold shadow-level-1 cursor-pointer h-8"
              >
                <Plus size={12} />
                New Chat
              </button>
              
              <select
                value={activeChatId || ''}
                onChange={(e) => {
                  setActiveChatId(e.target.value || null);
                  setError(null);
                }}
                className="h-8 px-2 bg-canvas border border-hairline rounded-sm text-xs font-medium text-ink max-w-[200px]"
              >
                <option value="">-- Active Chats --</option>
                {chats.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
              {activeChat && activeChat.messages.length > 0 ? (
                <div className="max-w-3xl mx-auto space-y-6 pb-8">
                  {activeChat.messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full bg-violet-soft border border-violet/20 flex items-center justify-center text-violet-deep shrink-0">
                            <Bot size={16} />
                          </div>
                        )}

                        {/* Content Container */}
                        <div className="max-w-[92%] sm:max-w-[85%] space-y-2">
                          <div className={`px-4 py-3 rounded-lg border text-xs leading-relaxed ${
                            isUser
                              ? 'bg-canvas border-hairline shadow-level-1 text-ink rounded-tr-none'
                              : 'bg-canvas border-hairline shadow-level-2 text-ink rounded-tl-none ai-markdown-content font-sans'
                          }`}>
                            {isUser ? (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            ) : message.content ? (
                              <div 
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} 
                              />
                            ) : (
                              /* Empty content indicates model loading state */
                              <div className="flex gap-1 items-center py-1">
                                <div className="w-1.5 h-1.5 bg-mute rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-mute rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-mute rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            )}
                          </div>

                          {/* Message Metadata / Actions */}
                          <div className={`flex items-center gap-3 text-[10px] text-mute px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            
                            {/* User Attachments Display */}
                            {isUser && message.attachments && message.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="font-mono text-[9px] uppercase">Attachments:</span>
                                {message.attachments.map(att => (
                                  <span key={att.id} className="inline-flex items-center gap-1 bg-canvas-soft-2 border border-hairline px-1.5 py-0.5 rounded-sm font-medium text-[9px]">
                                    <FileText size={10} className="text-mute shrink-0" />
                                    {att.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* AI Message Copy/Regenerate buttons */}
                            {!isUser && message.content && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopyMessage(message.id, message.content)}
                                  className="p-1 hover:bg-canvas border border-transparent hover:border-hairline rounded-sm transition-all cursor-pointer flex items-center gap-1"
                                  title="Copy response"
                                >
                                  {copiedMessageId === message.id ? (
                                    <>
                                      <Check size={10} className="text-link" />
                                      <span className="text-link font-medium">Copied</span>
                                    </>
                                  ) : (
                                    <Copy size={10} />
                                  )}
                                </button>
                                
                                {/* Show regenerate only on the last response */}
                                {index === activeChat.messages.length - 1 && !isGenerating && (
                                  <button
                                    onClick={() => regenerateResponse(message.id)}
                                    className="p-1 hover:bg-canvas border border-transparent hover:border-hairline rounded-sm transition-all cursor-pointer flex items-center gap-1"
                                    title="Regenerate response"
                                  >
                                    <RotateCcw size={10} />
                                    <span>Regenerate</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* User Avatar */}
                        {isUser && (
                          <div className="w-8 h-8 rounded-full bg-canvas-soft-2 border border-hairline flex items-center justify-center text-mute shrink-0">
                            <span className="text-[10px] font-bold font-mono">{currentUser.name.substring(0,2).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                /* Suggestion Empty State */
                <div className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-6 pt-12 pb-8">
                  <div className="w-12 h-12 bg-canvas border border-hairline flex items-center justify-center rounded-xl text-violet shadow-level-2 select-none">
                    <Bot size={24} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight text-ink font-sans">
                      Aapka personal AI Study Assistant.
                    </h2>
                    <p className="text-xs text-mute max-w-md mx-auto">
                      Ask programming questions, request flashcards, summarize notes, or practice interviews in Hinglish! Attach note context below.
                    </p>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full pt-4">
                    {[
                      { title: 'Create Flashcards', prompt: 'Create 5 study flashcards for HTML Semantics and tags.' },
                      { title: 'Explain DSA Concept', prompt: 'Hinglish me explain karo: Binary Search Algorithm and its time complexity step-by-step.' },
                      { title: 'Generate Study Notes', prompt: 'Write comprehensive study notes on React Hook state management (useState & useEffect).' },
                      { title: 'Interview Questions', prompt: 'Provide 5 common technical interview questions for Python Object-Oriented Programming (OOP).' }
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPromptInput(s.prompt)}
                        className="p-3 bg-canvas hover:bg-canvas-soft border border-hairline hover:border-hairline-strong rounded-md transition-all text-left text-xs text-body hover:text-ink cursor-pointer shadow-level-1 font-medium group"
                      >
                        <span className="font-semibold text-ink group-hover:text-violet block mb-1">{s.title}</span>
                        <span className="line-clamp-2 text-[10px] text-mute">{s.prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message banner */}
            {error && (
              <div className="mx-4 my-2 p-3 bg-error-soft/30 border border-error/20 text-error-deep rounded-md text-xs flex items-center gap-2.5 max-w-3xl sm:mx-auto w-full z-10 shrink-0">
                <AlertCircle size={14} className="shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={() => stopGenerating()} className="text-[10px] underline font-semibold cursor-pointer">Dismiss</button>
              </div>
            )}

            {/* Input and Attachment Area */}
            <div className="p-4 border-t border-hairline bg-canvas shrink-0 relative z-20 select-none">
              <div className="max-w-3xl mx-auto space-y-3">
                
                {/* Chosen attachment pills */}
                {selectedAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] text-mute font-mono">Context Attached:</span>
                    {selectedAttachments.map(att => (
                      <span
                        key={att.id}
                        className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 bg-canvas-soft border border-hairline rounded-full text-[10px] font-semibold text-ink shadow-level-1 animate-fade-in"
                      >
                        <FileText size={10} className="text-violet" />
                        <span>{att.name}</span>
                        <button
                          onClick={() => toggleAttachment(att)}
                          className="p-0.5 hover:bg-canvas-soft-2 rounded-full cursor-pointer text-mute hover:text-ink transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input Box Row */}
                <div className="relative flex items-end gap-2 border border-hairline rounded-md bg-canvas-soft focus-within:border-hairline-strong transition-colors p-2 shadow-level-1 min-h-[50px]">
                  
                  {/* Attachment Clip Button */}
                  <div className="relative" ref={attachmentMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                      className="p-2 hover:bg-canvas-soft-2 text-mute hover:text-ink rounded-full transition-colors cursor-pointer shrink-0 flex items-center justify-center h-9 w-9 sm:h-8 sm:w-8"
                      title="Attach Note or PDF context"
                    >
                      <Paperclip size={16} />
                    </button>

                    {/* Popover Dropdown Selection List (Responsive: bottom-sheet on mobile, popover on desktop) */}
                    {isAttachmentMenuOpen && (
                      <>
                        {/* Mobile dim backdrop */}
                        <div 
                          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
                          onClick={() => setIsAttachmentMenuOpen(false)}
                        />
                        <div className="fixed bottom-0 left-0 right-0 max-h-[70vh] rounded-t-xl border-t border-hairline p-4 pb-8 space-y-4 z-50 overflow-y-auto bg-canvas shadow-level-5 animate-slide-up md:absolute md:bottom-12 md:left-0 md:right-auto md:w-64 md:max-h-none md:rounded-md md:border md:p-3 md:pb-3 md:space-y-3 md:shadow-level-4 md:z-50 text-left">
                          {/* Drag handle decoration for mobile sheet */}
                          <div className="md:hidden w-12 h-1 bg-hairline-strong/30 rounded-full mx-auto mb-2" />
                          
                          {/* Sheet Header for mobile */}
                          <div className="md:hidden flex justify-between items-center pb-2 border-b border-hairline">
                            <span className="text-xs font-semibold text-ink">Attach Context</span>
                            <button
                              type="button"
                              onClick={() => setIsAttachmentMenuOpen(false)}
                              className="p-1 hover:bg-canvas-soft-2 rounded-full text-mute hover:text-ink cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-mono uppercase tracking-wider text-mute mb-1.5">Attach Study Note</h4>
                            <div className="max-h-28 md:max-h-36 overflow-y-auto space-y-1">
                              {availableNotes.map(n => (
                                <label key={n.id} className="flex items-center gap-2 px-1.5 py-1 hover:bg-canvas-soft rounded-sm cursor-pointer text-[11px] font-medium text-body hover:text-ink truncate">
                                  <input
                                    type="checkbox"
                                    checked={!!selectedAttachments.find(a => a.id === n.id && a.type === 'note')}
                                    onChange={() => toggleAttachment({ id: n.id, name: n.title, type: 'note' })}
                                    className="rounded-xs accent-violet shrink-0"
                                  />
                                  <span className="truncate">{n.title}</span>
                                </label>
                              ))}
                              {availableNotes.length === 0 && (
                                <span className="text-[10px] text-mute font-mono block px-1.5 py-1">No notes created yet</span>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-hairline pt-2">
                            <h4 className="text-[10px] font-mono uppercase tracking-wider text-mute mb-1.5">Attach PDF Document</h4>
                            <div className="max-h-28 md:max-h-36 overflow-y-auto space-y-1">
                              {availableFiles.map(f => (
                                <label key={f.id} className="flex items-center gap-2 px-1.5 py-1 hover:bg-canvas-soft rounded-sm cursor-pointer text-[11px] font-medium text-body hover:text-ink truncate">
                                  <input
                                    type="checkbox"
                                    checked={!!selectedAttachments.find(a => a.id === f.id && a.type === 'pdf')}
                                    onChange={() => toggleAttachment({ id: f.id, name: f.name, type: 'pdf' })}
                                    className="rounded-xs accent-violet shrink-0"
                                  />
                                  <span className="truncate">{f.name}</span>
                                </label>
                              ))}
                              {availableFiles.length === 0 && (
                                <span className="text-[10px] text-mute font-mono block px-1.5 py-1">No PDFs uploaded yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Prompt Textarea */}
                  <textarea
                    rows={1}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Gemini anything..."
                    className="flex-1 bg-transparent border-0 outline-none resize-none max-h-36 py-1.5 px-2 text-xs text-ink placeholder-mute focus:ring-0 leading-relaxed font-sans"
                    style={{ height: 'auto' }}
                  />

                  {/* Send or Stop button */}
                  {isGenerating ? (
                    <button
                      type="button"
                      onClick={stopGenerating}
                      className="p-2 bg-error-deep hover:bg-error text-on-primary rounded-full transition-colors cursor-pointer shrink-0 flex items-center justify-center h-9 w-9 sm:h-8 sm:w-8 shadow-level-2"
                      title="Stop generating"
                    >
                      <Square size={12} fill="white" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!promptInput.trim()}
                      className="p-2 bg-primary text-on-primary hover:opacity-90 disabled:opacity-30 rounded-full transition-all cursor-pointer shrink-0 flex items-center justify-center h-9 w-9 sm:h-8 sm:w-8 shadow-level-2 disabled:cursor-not-allowed"
                      title="Send message"
                    >
                      <Send size={12} fill="currentColor" />
                    </button>
                  )}
                </div>

                {/* Footer disclaimer */}
                <p className="text-[9px] text-mute text-center font-mono">
                  Gemini may produce inaccurate info. Consider checking context-attached notes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistantWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <AIAssistant />
    </ErrorBoundary>
  );
}
