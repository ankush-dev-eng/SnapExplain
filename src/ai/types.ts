// AI Provider Types
export interface StudyMaterial {
  text: string;
  imageDataUrl?: string;
}

export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  correctOptionId: string;
  explanation: string;
}

export interface StudyResult {
  explanation: string;
  summary: string;
  keyPoints: string[];
  mcqs: MCQuestion[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AIProvider {
  name: string;
  description: string;
  isLocal: boolean;
  isAvailable(): boolean;
  analyze(material: StudyMaterial): Promise<StudyResult>;
  chat(material: StudyMaterial, history: ChatMessage[], userMessage: string): Promise<string>;
}

export type ProviderType = 'demo' | 'local-llm';
