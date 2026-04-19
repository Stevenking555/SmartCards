export interface Card {
  id: string;
  question: string;
  answer: string;
}

export interface CardStats {
  batchIndex: number;
  rotationPoints: number;
  rotationIndex: number;
  isMastered: boolean;
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface DeckStats {
  knowledgePercentage: number;
  timeSpentMinutes: number;
  goal: string;
}

export interface DeckForUser {
  info: Deck;
  stats: DeckStats;
  cards?: CardWithStats[];
}

export interface CardWithStats {
  data: Card;
  stats: CardStats;
}