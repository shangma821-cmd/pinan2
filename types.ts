export enum AppMode {
  UPLOAD = 'UPLOAD',
  PROCESSING_PDF = 'PROCESSING_PDF',
  ANALYZING_FLOW = 'ANALYZING_FLOW', // Global script generation
  READY = 'READY',
  PRESENTING = 'PRESENTING',
  PAUSED = 'PAUSED', // User paused or interrupted
  QNA_LISTENING = 'QNA_LISTENING', // Listening to user question
  QNA_PROCESSING = 'QNA_PROCESSING', // Generating answer
  QNA_ANSWERING = 'QNA_ANSWERING', // Speaking answer
  COMPLETED = 'COMPLETED',
}

export interface SlideTextRegion {
  id: string;
  text: string;
  x: number; // Percentage, 0-100
  y: number; // Percentage, 0-100
  w: number; // Percentage, 0-100
  h: number; // Percentage, 0-100
}

export interface Slide {
  id: number;
  imageData: string; // Base64
  textRegions?: SlideTextRegion[]; // Text layer bounding boxes for precise highlight
  script?: string; // Generated speech script
  audioData?: string; // Base64 Audio PCM
  isGeneratingAudio?: boolean; // To prevent duplicate requests
}

export interface PresentationState {
  slides: Slide[];
  currentSlideIndex: number;
  mode: AppMode;
  isAudioPlaying: boolean;
  transcriptHistory: { role: 'user' | 'assistant'; text: string }[];
}

export interface AudioConfig {
  sampleRate: number;
}
