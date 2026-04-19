import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, of, Observable } from 'rxjs';
import { Deck, Card, DeckForUser, DeckStats, CardWithStats } from '../models/deck-models';
import { environment } from '../../environments/environment';
import { HomeService } from './home-service';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private http = inject(HttpClient);
  private homeService = inject(HomeService);
  baseUrl = environment.apiUrl;

  // Internal Writable Signals (Private)
  private _decks = signal<DeckForUser[]>([]);
  private _lastEditedDecks = signal<DeckForUser[]>([]);
  private _lastPlayedDecks = signal<DeckForUser[]>([]);

  // Public Read-only Signals (Encapsulation)
  public decks = this._decks.asReadonly();
  public lastEditedDecks = this._lastEditedDecks.asReadonly();
  public lastPlayedDecks = this._lastPlayedDecks.asReadonly();

  private initialLoadCompleted = false;

  addToLastEdited(deck: DeckForUser) {
    this.updateLRUSignal(this._lastEditedDecks, deck);
  }

  addToLastPlayed(deck: DeckForUser) {
    this.updateLRUSignal(this._lastPlayedDecks, deck);
  }

  private updateLRUSignal(sig: WritableSignal<DeckForUser[]>, deck: DeckForUser) {
    sig.update(current => {
      const list = [...current];
      const index = list.findIndex(d => d.info.id === deck.info.id);
      if (index !== -1) list.splice(index, 1);
      list.unshift(deck);
      if (list.length > 5) list.pop();
      return list;
    });
  }

  loadDecks(): Observable<DeckForUser[]> {
    if (this.initialLoadCompleted) {
      return of(this._decks());
    }

    this.loadLastPlayedDecks().subscribe();

    return this.http.get<DeckForUser[]>(this.baseUrl + 'decks/with-stats', { withCredentials: true }).pipe(
      tap(data => {
        this._decks.set(data);
        this.initialLoadCompleted = true;
      })
    );
  }

  loadLastPlayedDecks(limit: number = 5): Observable<DeckForUser[]> {
    if (this._lastPlayedDecks().length > 0) {
      return of(this._lastPlayedDecks());
    }
    return this.http.get<DeckForUser[]>(`${this.baseUrl}decks/last-played?limit=${limit}`, { withCredentials: true }).pipe(
      tap(data => {
        this._lastPlayedDecks.set(data);
      })
    );
  }

  getOrLoadDeckForGame(id: string): Observable<DeckForUser> {
    const fromEdit = this._lastEditedDecks().find(d => d.info.id === id);
    if (fromEdit) return of(fromEdit);

    const fromPlay = this._lastPlayedDecks().find(d => d.info.id === id);
    if (fromPlay) return of(fromPlay);

    return this.http.get<DeckForUser>(`${this.baseUrl}decks/${id}/for-game`, { withCredentials: true });
  }

  getDecks(): DeckForUser[] {
    return this._decks();
  }

  getDeckById(id: string): DeckForUser | undefined {
    return this._decks().find(d => d.info.id === id);
  }

  addDeck(title: string, goal: string): Observable<Deck> {
    return this.http.post<Deck>(this.baseUrl + 'decks', { title, goal }, { withCredentials: true }).pipe(
      tap(newDeck => {
        if (newDeck) {
          const newDeckForUser: DeckForUser = {
            info: newDeck,
            stats: { knowledgePercentage: 0, timeSpentMinutes: 0, goal: goal }
          };
          this._decks.update(current => [...current, newDeckForUser]);
          this.homeService.updateDeckCount(1);
        }
      })
    );
  }

  updateDeck(id: string, deckData: { title: string, description?: string }): Observable<any> {
    const title = deckData.title.trim();
    const description = deckData.description?.trim();
    return this.http.put(`${this.baseUrl}decks/${id}`, { title, description }, { withCredentials: true }).pipe(
      tap(() => {
        const updateFn = (d: DeckForUser) => {
          d.info.title = title;
          if (description !== undefined) d.info.description = description;
        };
        this.updateItemInSignals(id, updateFn);
      })
    );
  }

  deleteDeck(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}decks/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this._decks.update(list => list.filter(d => d.info.id !== id));
        this._lastPlayedDecks.update(list => list.filter(d => d.info.id !== id));
        this._lastEditedDecks.update(list => list.filter(d => d.info.id !== id));
        this.homeService.updateDeckCount(-1);
      })
    );
  }

  addCardToDeck(deckId: string, card: Omit<Card, 'id'>): Observable<CardWithStats> {
    const payload = { question: card.question, answer: card.answer };
    return this.http.post<CardWithStats>(`${this.baseUrl}decks/${deckId}/cards`, payload, { withCredentials: true }).pipe(
      tap(newCardWithStats => {
        if (newCardWithStats) {
          const updateFn = (d: DeckForUser) => {
            if (!d.cards) d.cards = [];
            d.cards.push(newCardWithStats);
          };
          this.updateItemInSignals(deckId, updateFn, true);
          this.homeService.updateCardCount(1);
        }
      })
    );
  }

  deleteCard(deckId: string, cardId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}decks/${deckId}/cards/${cardId}`, { withCredentials: true }).pipe(
      tap(() => {
        const filterFn = (d: DeckForUser) => {
          if (d.cards) d.cards = d.cards.filter(cw => cw.data.id !== cardId);
        };
        this.updateItemInSignals(deckId, filterFn, true);
        this.homeService.updateCardCount(-1);
      })
    );
  }

  updateCard(deckId: string, cardId: string, updatedData: Omit<Card, 'id'>): Observable<Card> {
    const payload = { question: updatedData.question, answer: updatedData.answer };
    return this.http.put<Card>(`${this.baseUrl}decks/${deckId}/cards/${cardId}`, payload, { withCredentials: true }).pipe(
      tap(updatedCard => {
        if (updatedCard) {
          const updateFn = (d: DeckForUser) => {
            if (d.cards) {
              const idx = d.cards.findIndex(cw => cw.data.id === cardId);
              if (idx !== -1) d.cards[idx].data = updatedCard;
            }
          };
          this.updateItemInSignals(deckId, updateFn);
        }
      })
    );
  }

  private updateItemInSignals(deckId: string, updateFn: (deck: DeckForUser) => void, isCardOp: boolean = false) {
    // Determine which signals to update
    // Summary list (_decks) only gets title/desc updates.
    // Detailed lists (Played/Edited) get everything.
    const signalsToUpdate = isCardOp
      ? [this._lastPlayedDecks, this._lastEditedDecks]
      : [this._decks, this._lastPlayedDecks, this._lastEditedDecks];

    signalsToUpdate.forEach(sig => {
      sig.update(list => {
        const newList = [...list];
        const idx = newList.findIndex(d => d.info.id === deckId);
        if (idx !== -1) {
          const item: DeckForUser = {
            ...newList[idx],
            cards: newList[idx].cards ? [...newList[idx].cards] : newList[idx].cards
          };
          updateFn(item);
          newList[idx] = item;
        }
        return newList;
      });
    });
  }
}