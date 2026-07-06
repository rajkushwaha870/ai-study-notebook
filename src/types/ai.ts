export interface Attachment {
  id: string;
  name: string;
  type: 'note' | 'pdf';
  content?: string; // HTML for note, base64 data URL for pdf (omitted in stored history to save space)
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AISettings {
  provider: 'gemini';
  configured: boolean;
  status: 'connected' | 'error' | 'not-configured';
  errorMessage?: string;
}
