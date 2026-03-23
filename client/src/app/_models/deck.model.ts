export interface Card {
  id: string;
  order: number;
  question: string;
  answer: string;
}

export interface Deck {
  id: string;
  title: string;
  cards: Card[];
  due: number;
  progress: number;
}
