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
  due: number;
  progress: number;
  cards: Card[];
}
