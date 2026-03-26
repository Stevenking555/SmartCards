export type Card = {
  id: string;
  order: number;
  question: string;
  answer: string;
}

export type Deck = {
  id: string;
  title: string;
  cards: Card[];
  due: number;
  progress: number;
}


