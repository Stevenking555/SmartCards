import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Deck, Card } from '../_models/deck.model';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  // Example decks for new users, and for UI/UX testing - we will replace this with API calls later
  private initialDecks: Deck[] = [
    { 
      id: '1', title: 'SmartCards Tutorial (EN)', due: 3, progress: 0, 
      cards: [
        { id: 'c1', order: 1, question: 'How can I flip the card while studying?', answer: 'Click anywhere on the card, or press the Space bar!' },
        { id: 'c2', order: 2, question: 'How should I rate my knowledge after flipping?', answer: 'Using the buttons (Again, Hard, Good, Easy). This determines the spaced repetition interval.' },
        { id: 'c3', order: 3, question: 'Where can I add a new deck or card?', answer: 'In the Decks menu with the "New Deck" button, or inside a deck using the "Add Card" feature.' }
      ]
    },
    { 
      id: '2', title: 'SmartCards Útmutató (HU)', due: 3, progress: 0, 
      cards: [
        { id: 'c4', order: 1, question: 'Hogyan fordíthatom meg a kártyát tanulás közben?', answer: 'Kattints bárhova a kártyán, vagy nyomd meg a szóköz (Space) billentyűt!' },
        { id: 'c5', order: 2, question: 'Mi alapján értékeljem a tudásom a forgatás után?', answer: 'A lenti gombok (Újra, Nehéz, Jó, Könnyű) segítségével. Ez alapján tervezi a rendszer az ismétlést.' },
        { id: 'c6', order: 3, question: 'Hol adhatok hozzá új paklit vagy kártyát?', answer: 'A Paklik menüpontban az "Új Pakli" gombbal, vagy a paklin belül az "Új Kártya" opcióval.' }
      ]
    }
  ];

  private decksSubject = new BehaviorSubject<Deck[]>(this.initialDecks);
  public decks$ = this.decksSubject.asObservable();

  // Later we will replace these methods with API calls from the bcakend

  getDecks(): Deck[] {
    return this.decksSubject.value;
  }

  getDeckByTitle(title: string): Deck | undefined {
    return this.decksSubject.value.find(d => d.title === title);
  }

  addDeck(title: string, goal: string) {
    const newDeck: Deck = {
      id: Date.now().toString(),
      title,
      cards: [],
      due: 0,
      progress: 0
    };
    this.decksSubject.next([...this.decksSubject.value, newDeck]);
  }

  updateDeckTitle(oldTitle: string, newTitle: string): boolean {
    const decks = this.getDecks();
    const deckIndex = decks.findIndex(d => d.title === oldTitle);
    
    if (deckIndex !== -1 && newTitle.trim() !== '') {
      // Check if new title already exists (excluding the current deck) with TS LINQ ;D
      if (decks.some(d => d.title.toLowerCase() === newTitle.trim().toLowerCase() && d.id !== decks[deckIndex].id)) {
        return false;
      }
      const updatedDecks = [...decks];
      updatedDecks[deckIndex] = { ...updatedDecks[deckIndex], title: newTitle.trim() };
      this.decksSubject.next(updatedDecks);
      return true;
    }
    return false;
  }

  deleteDeck(title: string) {
    this.decksSubject.next(this.decksSubject.value.filter(d => d.title !== title));
  }

  addCardToDeck(deckTitle: string, card: Omit<Card, 'id' | 'order'>) {
    const decks = this.getDecks();
    const deckIndex = decks.findIndex(d => d.title === deckTitle);
    
    if (deckIndex !== -1) {
      const deck = decks[deckIndex];
      const newCard: Card = {
        id: Date.now().toString(),
        order: deck.cards.length + 1,
        question: card.question,
        answer: card.answer
      };
      
      const updatedDeck = { ...deck, cards: [...deck.cards, newCard] };
      const updatedDecks = [...decks];
      updatedDecks[deckIndex] = updatedDeck;
      this.decksSubject.next(updatedDecks);
    }
  }

  deleteCard(deckTitle: string, cardId: string) {
    const decks = this.getDecks();
    const deckIndex = decks.findIndex(d => d.title === deckTitle);
    
    if (deckIndex !== -1) {
      const deck = decks[deckIndex];
      const updatedDeck = { ...deck, cards: deck.cards.filter(c => c.id !== cardId) };
      const updatedDecks = [...decks];
      updatedDecks[deckIndex] = updatedDeck;
      this.decksSubject.next(updatedDecks);
    }
  }

  updateCard(deckTitle: string, cardId: string, updatedData: Omit<Card, 'id' | 'order'>) {
    const decks = this.getDecks();
    const deckIndex = decks.findIndex(d => d.title === deckTitle);
    
    if (deckIndex !== -1) {
      const deck = decks[deckIndex];
      const cardIndex = deck.cards.findIndex(c => c.id === cardId);
      
      if (cardIndex !== -1) {
        const updatedCards = [...deck.cards];
        updatedCards[cardIndex] = {
          ...updatedCards[cardIndex],
          question: updatedData.question.trim(),
          answer: updatedData.answer.trim()
        };
        
        const updatedDeck = { ...deck, cards: updatedCards };
        const updatedDecks = [...decks];
        updatedDecks[deckIndex] = updatedDeck;
        this.decksSubject.next(updatedDecks);
      }
    }
  }
}
