import type { Attachment } from '../types/ai';

export const apiClient = {
  async testConnection(): Promise<{ status: 'connected' | 'error' | 'not-configured'; message?: string }> {
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Connection test failed');
      }
      return data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Failed to connect to backend server',
      };
    }
  },

  async streamChat(
    prompt: string,
    attachments: Attachment[],
    onChunk: (text: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, attachments }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server returned status ${response.status}`);
    }

    const body = response.body;
    if (!body) {
      throw new Error('Response body is empty or not streamable');
    }

    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });
        onChunk(chunkText);
      }
    } finally {
      reader.releaseLock();
    }
  }
};
