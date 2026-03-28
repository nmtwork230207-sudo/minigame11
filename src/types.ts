export type Team = {
  id: string;
  name: string;
  score: number;
  color: string;
};

export type Question = {
  id: string;
  text: string;
  answer: string;
  options?: string[];
  imageUrl?: string;
  audioUrl?: string;
  hint?: string;
  type?: 'multiple_choice' | 'open_ended';
  round?: 1 | 2 | 3;
};

export type WheelItem = {
  label: string;
  value: number;
  type: 'points' | 'action';
  audioUrl?: string;
  hint?: string;
};

export type CardType = 'normal' | 'gold' | 'bomb' | 'lucky_wheel';

export type Card = {
  id: string;
  pairId: string;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: CardType;
  isImage?: boolean;
};

export type CardPairConfig = {
  id: string;
  content: string;
  isImage: boolean;
};

export type CardConfig = {
  round1Points: number;
  round2Points: number;
  round3Points: number;
  goldPoints: number;
  bombPoints: number;
  cardBackImage?: string;
  pairs: CardPairConfig[];
};

export type GameState = 'setup' | 'playing' | 'leaderboard';
export type Round = 1 | 2 | 3;
export type PlayPhase = 'waiting_next_question' | 'question' | 'team_selection' | 'answering' | 'wheel_penalty' | 'flipping' | 'wheel_reward';


