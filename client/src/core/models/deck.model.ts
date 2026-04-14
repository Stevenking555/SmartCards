export interface Card {
  id: string;
  order: number;
  question: string;
  answer: string;
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  progress: number;
  timeSpentMinutes: number;
  cards: Card[];
}
