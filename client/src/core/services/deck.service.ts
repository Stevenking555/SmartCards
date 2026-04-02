import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, of } from 'rxjs';
import { Deck, Card } from '../models/deck.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  // Subjects for local state management
  private initialDecks: Deck[] = [];

  private decksSubject = new BehaviorSubject<Deck[]>(this.initialDecks);
  public decks$ = this.decksSubject.asObservable();

  private initialLoadCompleted = false;

  loadDecks() {
    if (this.initialLoadCompleted) {
      return of(this.decksSubject.value);
    }
    return this.http.get<Deck[]>(this.baseUrl + 'decks', { withCredentials: true }).pipe(
      tap(decks => {
        this.decksSubject.next(decks);
        this.initialLoadCompleted = true;
      })
    );
  }

  getDecks(): Deck[] {
    return this.decksSubject.value;
  }

  getDeckByTitle(title: string): Deck | undefined {
    return this.decksSubject.value.find(d => d.title === title);
  }

  addDeck(title: string, goal: string) {
    return this.http.post<Deck>(this.baseUrl + 'decks', { title, goal }, { withCredentials: true }).pipe(
      tap(newDeck => {
        if (newDeck) {
          this.decksSubject.next([...this.decksSubject.value, newDeck]);
        }
      })
    );
  }

  updateDeckTitle(oldTitle: string, newTitle: string) {
    const deck = this.getDeckByTitle(oldTitle);
    if (!deck) throw new Error("Deck not found locally.");

    return this.http.put<Deck>(`${this.baseUrl}decks/${deck.id}`, { title: newTitle.trim() }, { withCredentials: true }).pipe(
      tap(updatedDeck => {
        if (updatedDeck) {
          const decks = this.getDecks();
          const index = decks.findIndex(d => d.id === updatedDeck.id);
          if (index !== -1) {
            const newDecks = [...decks];
            newDecks[index] = updatedDeck;
            this.decksSubject.next(newDecks);
          }
        }
      })
    );
  }

  deleteDeck(title: string) {
    const deck = this.getDeckByTitle(title);
    if (!deck) throw new Error("Deck not found locally.");

    return this.http.delete(`${this.baseUrl}decks/${deck.id}`, { withCredentials: true }).pipe(
      tap(() => {
        this.decksSubject.next(this.decksSubject.value.filter(d => d.id !== deck.id));
      })
    );
  }

  addCardToDeck(deckTitle: string, card: Omit<Card, 'id' | 'order'>) {
    const deck = this.getDeckByTitle(deckTitle);
    if (!deck) throw new Error("Deck not found locally.");

    return this.http.post<Card>(`${this.baseUrl}decks/${deck.id}/cards`, card, { withCredentials: true }).pipe(
      tap(newCard => {
        if (newCard) {
          const decks = this.getDecks();
          const deckIndex = decks.findIndex(d => d.id === deck.id);
          if (deckIndex !== -1) {
            const updatedDeck = { ...decks[deckIndex], cards: [...decks[deckIndex].cards, newCard] };
            const updatedDecks = [...decks];
            updatedDecks[deckIndex] = updatedDeck;
            this.decksSubject.next(updatedDecks);
          }
        }
      })
    );
  }

  deleteCard(deckTitle: string, cardId: string) {
    const deck = this.getDeckByTitle(deckTitle);
    if (!deck) throw new Error("Deck not found locally.");

    return this.http.delete(`${this.baseUrl}decks/${deck.id}/cards/${cardId}`, { withCredentials: true }).pipe(
      tap(() => {
        const decks = this.getDecks();
        const deckIndex = decks.findIndex(d => d.id === deck.id);
        if (deckIndex !== -1) {
          const updatedDeck = { ...decks[deckIndex], cards: decks[deckIndex].cards.filter(c => c.id !== cardId) };
          const updatedDecks = [...decks];
          updatedDecks[deckIndex] = updatedDeck;
          this.decksSubject.next(updatedDecks);
        }
      })
    );
  }

  updateCard(deckTitle: string, cardId: string, updatedData: Omit<Card, 'id' | 'order'>) {
    const deck = this.getDeckByTitle(deckTitle);
    if (!deck) throw new Error("Deck not found locally.");

    return this.http.put<Card>(`${this.baseUrl}decks/${deck.id}/cards/${cardId}`, updatedData, { withCredentials: true }).pipe(
      tap(updatedCard => {
        if (updatedCard) {
          const decks = this.getDecks();
          const deckIndex = decks.findIndex(d => d.id === deck.id);
          if (deckIndex !== -1) {
            const cardIndex = decks[deckIndex].cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
              const updatedCards = [...decks[deckIndex].cards];
              updatedCards[cardIndex] = updatedCard;

              const updatedDeck = { ...decks[deckIndex], cards: updatedCards };
              const updatedDecks = [...decks];
              updatedDecks[deckIndex] = updatedDeck;
              this.decksSubject.next(updatedDecks);
            }
          }
        }
      })
    );
  }
}