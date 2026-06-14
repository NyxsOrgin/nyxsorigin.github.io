export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  taskAdded?: {
    title: string;
    type: 'task' | 'reminder';
    due: string | null;
  };
}

export interface Task {
  id: string;
  title: string;
  type: 'task' | 'reminder';
  due: string | null;
  done: boolean;
  createdAt: number;
}

export interface Settings {
  elevenKey: string;
  voiceId: string;
  voiceEnabled: boolean;
  wakeEnabled: boolean;
  userName: string;
  localVoiceEnabled: boolean;
}
