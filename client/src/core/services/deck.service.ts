import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, of, Observable } from 'rxjs';
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

  loadDeckWithCards(id: string): Observable<{ deck: Deck, cards: Card[] } | null> {
    const deck = this.getDeckById(id);
    if (!deck) return of(null);

    return this.http.get<{ deck: Deck, cards: Card[] }>(`${this.baseUrl}decks/${deck.id}/with-cards`, { withCredentials: true }).pipe(
      tap(response => {
        if (response) {
          const decks = this.getDecks();
          const index = decks.findIndex(d => d.id === deck.id);
          if (index !== -1) {
            const updatedDecks = [...decks];
            updatedDecks[index] = { ...response.deck, cards: response.cards };
            this.decksSubject.next(updatedDecks);
          }
        }
      })
    );
  }

  getDeckForGame(id: string) {
    return this.http.get<{ deck: Deck, cards: (Card & { stats?: any })[] }>(`${this.baseUrl}decks/${id}/for-game`, { withCredentials: true });
  }

  getDecks(): Deck[] {
    return this.decksSubject.value;
  }

  getDeckById(id: string): Deck | undefined {
    return this.decksSubject.value.find(d => d.id === id);
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

  updateDeckTitle(id: string, newTitle: string) {
    return this.http.put(`${this.baseUrl}decks/${id}`, { title: newTitle.trim() }, { withCredentials: true }).pipe(
      tap(() => {
        const decks = this.getDecks();
        const index = decks.findIndex(d => d.id === id);
        if (index !== -1) {
          const newDecks = [...decks];
          newDecks[index] = { ...newDecks[index], title: newTitle.trim() };
          this.decksSubject.next(newDecks);
        }
      })
    );
  }

  deleteDeck(id: string) {
    return this.http.delete(`${this.baseUrl}decks/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this.decksSubject.next(this.decksSubject.value.filter(d => d.id !== id));
      })
    );
  }

  addCardToDeck(deckId: string, card: Omit<Card, 'id' | 'order'>) {
    const deck = this.getDeckById(deckId);
    if (!deck) throw new Error("Deck not found locally.");

    return this.http.post<Card>(`${this.baseUrl}decks/${deck.id}/cards`, card, { withCredentials: true }).pipe(
      tap(newCard => {
        if (newCard) {
          const decks = this.getDecks();
          const deckIndex = decks.findIndex(d => d.id === deck.id);
          if (deckIndex !== -1) {
            const currentCards = decks[deckIndex].cards || [];
            const updatedDeck = { ...decks[deckIndex], cards: [...currentCards, newCard] };
            const updatedDecks = [...decks];
            updatedDecks[deckIndex] = updatedDeck;
            this.decksSubject.next(updatedDecks);
          }
        }
      })
    );
  }

  deleteCard(deckId: string, cardId: string) {
    const deck = this.getDeckById(deckId);
    if (!deck) throw new Error("Deck not found locally.");

    return this.http.delete(`${this.baseUrl}decks/${deck.id}/cards/${cardId}`, { withCredentials: true }).pipe(
      tap(() => {
        const decks = this.getDecks();
        const deckIndex = decks.findIndex(d => d.id === deck.id);
        if (deckIndex !== -1) {
          const currentCards = decks[deckIndex].cards || [];
          const updatedDeck = { ...decks[deckIndex], cards: currentCards.filter(c => c.id !== cardId) };
          const updatedDecks = [...decks];
          updatedDecks[deckIndex] = updatedDeck;
          this.decksSubject.next(updatedDecks);
        }
      })
    );
  }

  updateCard(deckId: string, cardId: string, updatedData: Omit<Card, 'id' | 'order'>) {
    const deck = this.getDeckById(deckId);
    if (!deck) throw new Error("Deck not found locally.");

    return this.http.put<Card>(`${this.baseUrl}decks/${deck.id}/cards/${cardId}`, updatedData, { withCredentials: true }).pipe(
      tap(updatedCard => {
        if (updatedCard) {
          const decks = this.getDecks();
          const deckIndex = decks.findIndex(d => d.id === deck.id);
          if (deckIndex !== -1) {
            const currentCards = decks[deckIndex].cards || [];
            const cardIndex = currentCards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
              const updatedCards = [...currentCards];
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