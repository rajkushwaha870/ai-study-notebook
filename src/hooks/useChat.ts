import { useState, useEffect, useRef } from 'react';
import type { ChatSession, ChatMessage, Attachment } from '../types/ai';
import { apiClient } from '../api/client';
import { db, type User } from '../utils/db';
import { getFileContent } from '../utils/indexedDB';

async function resolveAttachmentContents(attachments: Attachment[], userId: string): Promise<Attachment[]> {
  const resolved: Attachment[] = [];
  for (const att of attachments) {
    if (att.type === 'note') {
      const note = db.getNotes(userId).find(n => n.id === att.id);
      if (note) {
        resolved.push({
          ...att,
          content: note.content
        });
      }
    } else if (att.type === 'pdf') {
      try {
        const fileContent = await getFileContent(att.id);
        if (fileContent) {
          resolved.push({
            ...att,
            content: fileContent
          });
        }
      } catch (err) {
        console.error('Failed to load PDF content for attachment:', att.id, err);
      }
    }
  }
  return resolved;
}

export function parseGeminiError(errorStr: string): string {
  if (!errorStr) {
    return 'An unexpected error occurred. Please try again.';
  }

  try {
    const jsonMatch = errorStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const gError = parsed.error || parsed;
      if (gError) {
        const code = gError.code;
        const message = gError.message || '';
        const status = gError.status || '';

        if (code === 429 || status === 'RESOURCE_EXHAUSTED' || message.toLowerCase().includes('quota')) {
          return 'Gemini API Quota Exceeded (Rate Limit). Please check your plan details and billing in Google AI Studio, or wait a few seconds and try again.';
        }
        if (code === 400 && (message.toLowerCase().includes('api key') || message.toLowerCase().includes('key'))) {
          return 'Invalid Gemini API Key configured. Please verify your GEMINI_API_KEY environment variable settings.';
        }
        if (message) {
          return message;
        }
      }
    }
  } catch (e) {
    // Ignore JSON parsing errors and fall back to string checking
  }

  const lower = errorStr.toLowerCase();
  if (lower.includes('quota') || lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('too many requests')) {
    return 'Gemini API Quota Exceeded (Rate Limit). Please check your plan details and billing in Google AI Studio, or wait a few seconds and try again.';
  }
  if (lower.includes('key') || lower.includes('invalid') || lower.includes('unauthorized') || lower.includes('403')) {
    return 'Invalid Gemini API Key. Please verify your GEMINI_API_KEY environment variable settings.';
  }
  if (lower.includes('api key not configured')) {
    return 'Gemini API key not configured.';
  }

  return errorStr;
}

export function useChat() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load user and chats on mount
  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const storedChats = localStorage.getItem(`study_notes_ai_chats_${user.id}`);
      if (storedChats) {
        try {
          const parsed = JSON.parse(storedChats);
          setChats(parsed);
          if (parsed.length > 0) {
            setActiveChatId(parsed[0].id);
          }
        } catch (e) {
          console.error('Failed to parse chats:', e);
        }
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (currentUser && chats.length >= 0) {
      localStorage.setItem(`study_notes_ai_chats_${currentUser.id}`, JSON.stringify(chats));
    }
  }, [chats, currentUser]);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const newChat = () => {
    setActiveChatId(null);
    setSelectedAttachments([]);
    setError(null);
  };

  const renameChat = (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setChats(prev =>
      prev.map(c => (c.id === chatId ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() } : c))
    );
  };

  const deleteChat = (chatId: string) => {
    if (confirm('Are you sure you want to delete this chat history?')) {
      setChats(prev => {
        const filtered = prev.filter(c => c.id !== chatId);
        if (activeChatId === chatId) {
          if (filtered.length > 0) {
            setActiveChatId(filtered[0].id);
          } else {
            setActiveChatId(null);
          }
        }
        return filtered;
      });
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const sendMessage = async (promptText: string) => {
    if (!promptText.trim() || !currentUser || isGenerating) return;

    let currentSession = chats.find(c => c.id === activeChatId);
    let currentSessionId = activeChatId;

    // Create a new session if none is active
    if (!currentSession) {
      currentSessionId = 'chat-' + Math.random().toString(36).substr(2, 9);
      const title = promptText.trim().substring(0, 30) + (promptText.length > 30 ? '...' : '');
      const newSession: ChatSession = {
        id: currentSessionId,
        userId: currentUser.id,
        title: title || 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      currentSession = newSession;
      setChats(prev => [newSession, ...prev]);
      setActiveChatId(currentSessionId);
    }

    const userMsgId = 'msg-' + Math.random().toString(36).substr(2, 9);
    const attachmentsToStore = selectedAttachments.map(att => ({
      id: att.id,
      name: att.name,
      type: att.type,
    }));

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachmentsToStore,
    };

    const modelMsgId = 'msg-' + Math.random().toString(36).substr(2, 9);
    const modelMessage: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...currentSession.messages, userMessage, modelMessage];
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    // Update UI immediately with empty model message placeholder
    setChats(prev => prev.map(c => (c.id === currentSessionId ? updatedSession : c)));
    setSelectedAttachments([]);
    setError(null);
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const attachmentsWithContent = await resolveAttachmentContents(selectedAttachments, currentUser.id);
      let fullResponseText = '';

      await apiClient.streamChat(
        promptText.trim(),
        attachmentsWithContent,
        (chunk) => {
          fullResponseText += chunk;
          setChats(prev =>
            prev.map(c => {
              if (c.id === currentSessionId) {
                const msgs = c.messages.map(m => (m.id === modelMsgId ? { ...m, content: fullResponseText } : m));
                return { ...c, messages: msgs };
              }
              return c;
            })
          );
        },
        abortController.signal
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        const errorMsg = parseGeminiError(err.message || 'Failed to generate response');
        setError(errorMsg);
        setChats(prev =>
          prev.map(c => {
            if (c.id === currentSessionId) {
              const msgs = c.messages.map(m => {
                if (m.id === modelMsgId && !m.content) {
                  return { ...m, content: `Error: ${errorMsg}` };
                }
                return m;
              });
              return { ...c, messages: msgs };
            }
            return c;
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const regenerateResponse = async (messageId: string) => {
    if (!activeChatId || !currentUser || isGenerating) return;
    const session = chats.find(c => c.id === activeChatId);
    if (!session) return;

    const msgIndex = session.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Find the user message just before this message
    let lastUserPrompt = '';
    let storedAttachments: Attachment[] = [];
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (session.messages[i].role === 'user') {
        lastUserPrompt = session.messages[i].content;
        storedAttachments = session.messages[i].attachments || [];
        break;
      }
    }

    if (!lastUserPrompt) return;

    // Slice messages up to the user message
    const userMsgIndex = session.messages.findIndex(m => m.role === 'user' && m.content === lastUserPrompt);
    const keptMessages = session.messages.slice(0, userMsgIndex + 1);

    const modelMsgId = 'msg-' + Math.random().toString(36).substr(2, 9);
    const modelMessage: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const updatedSession = {
      ...session,
      messages: [...keptMessages, modelMessage],
      updatedAt: new Date().toISOString(),
    };

    setChats(prev => prev.map(c => (c.id === activeChatId ? updatedSession : c)));
    setError(null);
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const attachmentsWithContent = await resolveAttachmentContents(storedAttachments, currentUser.id);
      let fullResponseText = '';

      await apiClient.streamChat(
        lastUserPrompt,
        attachmentsWithContent,
        (chunk) => {
          fullResponseText += chunk;
          setChats(prev =>
            prev.map(c => {
              if (c.id === activeChatId) {
                const msgs = c.messages.map(m => (m.id === modelMsgId ? { ...m, content: fullResponseText } : m));
                return { ...c, messages: msgs };
              }
              return c;
            })
          );
        },
        abortController.signal
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream regeneration aborted.');
      } else {
        const errorMsg = parseGeminiError(err.message || 'Failed to regenerate response');
        setError(errorMsg);
        setChats(prev =>
          prev.map(c => {
            if (c.id === activeChatId) {
              const msgs = c.messages.map(m => {
                if (m.id === modelMsgId && !m.content) {
                  return { ...m, content: `Error: ${errorMsg}` };
                }
                return m;
              });
              return { ...c, messages: msgs };
            }
            return c;
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const toggleAttachment = (attachment: Attachment) => {
    setSelectedAttachments(prev => {
      const exists = prev.find(a => a.id === attachment.id);
      if (exists) {
        return prev.filter(a => a.id !== attachment.id);
      } else {
        return [...prev, attachment];
      }
    });
  };

  return {
    currentUser,
    chats,
    activeChatId,
    activeChat,
    selectedAttachments,
    isGenerating,
    error,
    newChat,
    sendMessage,
    regenerateResponse,
    stopGenerating,
    renameChat,
    deleteChat,
    toggleAttachment,
    setActiveChatId,
  };
}
