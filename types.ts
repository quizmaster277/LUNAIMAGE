
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export type AppMode = 'generate' | 'edit' | 'gallery';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
