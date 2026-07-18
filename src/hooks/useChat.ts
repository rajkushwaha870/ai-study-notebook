import { useState, useEffect, useRef } from 'react';
import type { ChatSession, ChatMessage, Attachment } from '../types/ai';
import { apiClient } from '../api/client';
import { db, type User } from '../utils/db';
import { supabase } from '../utils/supabaseClient';

async function resolveAttachmentContents(attachments: Attachment[], userId: string): Promise<Attachment[]> {
  const resolved: Attachment[] = [];
  for (const att of attachments) {
    if (att.type === 'note') {
      const notes = await db.getNotes(userId);
      const note = notes.find(n => n.id === att.id);
      if (note) {
        resolved.push({
          ...att,
          content: note.content
        });
      }
    } else if (att.type === 'pdf') {
      try {
        const fileContent = await db.getFileContent(userId, att.id);
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
    // Ignore JSON parsing errors
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
  const [authChecked, setAuthChecked] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load user and chats on mount
  useEffect(() => {
    const loadChats = async () => {
      const user = await db.getCurrentUserAsync();
      if (user) {
        setCurrentUser(user);
        try {
          const storedChats = await db.getChats(user.id);
          setChats(storedChats);
          if (storedChats.length > 0) {
            setActiveChatId(storedChats[0].id);
          }
        } catch (e: any) {
          console.error('Failed to load chats from Supabase:', e);
          setError(e.message || 'Failed to load chats from Supabase. Please verify your connection.');
        }
      } else {
        window.location.href = '/login';
      }
      setAuthChecked(true);
    };
    loadChats();
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const newChat = () => {
    setActiveChatId(null);
    setSelectedAttachments([]);
    setError(null);
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setChats(prev =>
      prev.map(c => (c.id === chatId ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() } : c))
    );
    try {
      await db.updateChatSessionTitle(chatId, newTitle.trim());
    } catch (e) {
      console.error('Failed to rename chat in Supabase:', e);
    }
  };

  const deleteChat = async (chatId: string) => {
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
      try {
        await db.deleteChatSession(chatId);
      } catch (e) {
        console.error('Failed to delete chat in Supabase:', e);
      }
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

    let currentSessionId = activeChatId;
    let currentSession = chats.find(c => c.id === currentSessionId);

    // Create a new session if none is active
    if (!currentSessionId || !currentSession) {
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

      try {
        await db.addChatSession(currentUser.id, currentSessionId, title);
      } catch (e) {
        console.error('Failed to add chat session to Supabase:', e);
      }
    }

    const sessionId: string = currentSessionId;

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

    try {
      await db.addChatMessage(sessionId, userMessage);
    } catch (e) {
      console.error('Failed to add user message to Supabase:', e);
    }

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
    setChats(prev => prev.map(c => (c.id === sessionId ? updatedSession : c)));
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
              if (c.id === sessionId) {
                const msgs = c.messages.map(m => (m.id === modelMsgId ? { ...m, content: fullResponseText } : m));
                return { ...c, messages: msgs };
              }
              return c;
            })
          );
        },
        abortController.signal
      );

      // Save model message to Supabase
      try {
        await db.addChatMessage(sessionId, {
          ...modelMessage,
          content: fullResponseText
        });
      } catch (e) {
        console.error('Failed to save assistant message to Supabase:', e);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        const errorMsg = parseGeminiError(err.message || 'Failed to generate response');
        setError(errorMsg);
        const finalErrorContent = `Error: ${errorMsg}`;
        setChats(prev =>
          prev.map(c => {
            if (c.id === sessionId) {
              const msgs = c.messages.map(m => {
                if (m.id === modelMsgId && !m.content) {
                  return { ...m, content: finalErrorContent };
                }
                return m;
              });
              return { ...c, messages: msgs };
            }
            return c;
          })
        );

        // Save failed assistant message
        try {
          await db.addChatMessage(sessionId, {
            ...modelMessage,
            content: finalErrorContent
          });
        } catch (e) {
          console.error(e);
        }
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const regenerateResponse = async (messageId: string) => {
    const chatId = activeChatId;
    if (!chatId || !currentUser || isGenerating) return;
    const session = chats.find(c => c.id === chatId);
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

    setChats(prev => prev.map(c => (c.id === chatId ? updatedSession : c)));
    setError(null);
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Rewrite session history in Supabase to match the regeneration point
    try {
      await db.truncateChatHistory(chatId, keptMessages);
    } catch (e) {
      console.error('Failed to truncate chat history in Supabase:', e);
    }

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
              if (c.id === chatId) {
                const msgs = c.messages.map(m => (m.id === modelMsgId ? { ...m, content: fullResponseText } : m));
                return { ...c, messages: msgs };
              }
              return c;
            })
          );
        },
        abortController.signal
      );

      // Save regenerated model message
      try {
        await db.addChatMessage(chatId, {
          ...modelMessage,
          content: fullResponseText
        });
      } catch (e) {
        console.error('Failed to save regenerated message to Supabase:', e);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream regeneration aborted.');
      } else {
        const errorMsg = parseGeminiError(err.message || 'Failed to regenerate response');
        setError(errorMsg);
        const finalErrorContent = `Error: ${errorMsg}`;
        setChats(prev =>
          prev.map(c => {
            if (c.id === activeChatId) {
              const msgs = c.messages.map(m => {
                if (m.id === modelMsgId && !m.content) {
                  return { ...m, content: finalErrorContent };
                }
                return m;
              });
              return { ...c, messages: msgs };
            }
            return c;
          })
        );

        try {
          await db.addChatMessage(activeChatId, {
            ...modelMessage,
            content: finalErrorContent
          });
        } catch (e) {
          console.error(e);
        }
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
    setActiveChatId,
  };
}
