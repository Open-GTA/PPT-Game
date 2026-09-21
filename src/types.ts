export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content?: string;
  src?: string;
  x?: number; // percentage 0-100 or relative
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: string;
  fontColor?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  isBullet?: boolean;
}

export interface SlideData {
  id: string;
  title: string;
  subtitle?: string;
  points?: number; // question point value
  category?: string;
  bullets?: string[];
  answer?: string;
  notes?: string;
  elements?: SlideElement[];
  imageUrl?: string;
  backgroundColor?: string;
  customHtml?: string;
}

export interface PresentationDeck {
  id: string;
  title: string;
  description?: string;
  slides: SlideData[];
  sourceType: 'built-in' | 'uploaded-pptx' | 'uploaded-images';
  fileName?: string;
  rawPptxBuffer?: ArrayBuffer;
}

export type ParticipantMode = 'teams' | 'members';
export type ThemeMode = 'light' | 'dark';

export type ParticipantColor =
  | 'cyan'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'indigo'
  | 'purple'
  | 'fuchsia'
  | 'teal';

export interface Participant {
  id: string;
  name: string;
  score: number;
  color: ParticipantColor;
  keyLabel: string; // e.g. '1 / A', '2 / B', etc.
  avatarEmoji: string; // Expressive random Emoji DP for each member
}

export interface ScoreHistoryItem {
  id: string;
  participantId: string;
  participantName: string;
  delta: number;
  newScore: number;
  timestamp: number;
  slideNumber: number;
  reason?: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  transitionType: 'slide' | 'fade' | 'zoom';
  pointStep: number; // default 10
}

export interface ScoreJumpEvent {
  id: string;
  participantId: string;
  participantName: string;
  avatarEmoji: string;
  color: ParticipantColor;
  delta: number;
  newScore: number;
  timestamp: number;
}
