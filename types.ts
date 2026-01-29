export interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string;
  audioUrl?: string;
  timestamp: Date;
  isProcessing?: boolean;
}

export interface ChatState {
  messages: Message[];
  isRecording: boolean;
  isThinking: boolean;
}

export interface DeploymentRequirement {
  title: string;
  description: string;
  icon: string;
}