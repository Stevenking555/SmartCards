import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CardSessionUpdateDto {
  cardId: string;
  batchIndex: number;
  rotationPoints: number;
  isMastered: boolean;
}

export interface UpdateSessionStatsDto {
  deckId: string;
  flippedCardsTotal: number;
  flippedCardsToday: number;
  lastFlipAt: string;
  timeSpentMinutes: number;
  lastPlayedAt: string;
  cards: CardSessionUpdateDto[];
}

@Injectable({
  providedIn: 'root'
})
export class StudySessionService implements OnDestroy {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  private activeDeckId: string | null = null;
  private startTime: number = 0;
  private flippedCardsTotal: number = 0;
  private flippedCardsToday: number = 0;

  // Track individual card interactions
  private cardUpdates: Map<string, CardSessionUpdateDto> = new Map();

  private autoSaveInterval: any;

  /**
   * Starts tracking a new study session for a specific deck.
   */
  startSession(deckId: string) {
    if (this.activeDeckId && this.activeDeckId !== deckId) {
      this.syncNow(); // Save previous session if switching decks
    }

    this.activeDeckId = deckId;
    this.startTime = Date.now();
    this.flippedCardsTotal = 0;
    this.flippedCardsToday = 0;
    this.cardUpdates.clear();

    // Clear existing interval if any
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Auto-save every 5 minutes (300,000 ms)
    this.autoSaveInterval = setInterval(() => {
      this.syncNow();
    }, 5 * 60 * 1000);
  }

  /**
   * Records a card flip and rating.
   */
  recordCardInteraction(cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') {
    if (!this.activeDeckId) return;

    this.flippedCardsTotal++;
    this.flippedCardsToday++;

    // Base logic for mastering a card. A real spaced repetition algorithm would be more complex.
    const isMastered = rating === 'easy' || rating === 'good';

    // Add or update card in map
    const existing = this.cardUpdates.get(cardId);

    // Simplistic rotation/batch track for demo purposes
    this.cardUpdates.set(cardId, {
      cardId: cardId,
      batchIndex: existing ? existing.batchIndex : 0,
      rotationPoints: existing ? existing.rotationPoints + 1 : 1,
      isMastered: isMastered
    });
  }

  /**
   * Calculates the minutes spent since startTime (or last sync).
   */
  private calculateTimeSpentMinutes(): number {
    if (this.startTime === 0) return 0;
    const now = Date.now();
    const diffMs = now - this.startTime;
    return Math.floor(diffMs / 60000); // converting ms to minutes
  }

  /**
   * Prepares the DTO with the current accumulated statistics.
   */
  private preparePayload(): UpdateSessionStatsDto | null {
    if (!this.activeDeckId) return null;

    const timeSpent = this.calculateTimeSpentMinutes();

    // If there was no activity, do not sync
    if (this.flippedCardsTotal === 0 && timeSpent === 0 && this.cardUpdates.size === 0) {
      return null;
    }

    const payload: UpdateSessionStatsDto = {
      deckId: this.activeDeckId,
      flippedCardsTotal: this.flippedCardsTotal,
      flippedCardsToday: this.flippedCardsToday,
      lastFlipAt: new Date().toISOString(),
      timeSpentMinutes: timeSpent,
      lastPlayedAt: new Date().toISOString(),
      cards: Array.from(this.cardUpdates.values())
    };

    return payload;
  }

  /**
   * Resets local counters after a successful save.
   */
  private resetCounters() {
    this.startTime = Date.now(); // Reset time to start counting next delta
    this.flippedCardsTotal = 0;
    this.flippedCardsToday = 0;
    this.cardUpdates.clear();
  }

  /**
   * Triggers an immediate HTTP POST to sync data (for regular navigation).
   */
  syncNow() {
    const payload = this.preparePayload();
    if (!payload) return;

    this.http.post(`${this.baseUrl}stats/session`, payload, { withCredentials: true }).subscribe({
      next: () => this.resetCounters(),
      error: (err) => console.error('Failed to sync study session', err)
    });
  }

  /**
   * Uses navigator.sendBeacon to ensure data is saved when the tab is closed.
   */
  syncOnUnload() {
    const payload = this.preparePayload();
    if (!payload) return;

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

    // Beacon respects CORS if credentials are set, but simpler to use explicit URL.
    // Ensure CORS allows credentials for this endpoint if necessary.
    navigator.sendBeacon(`${this.baseUrl}stats/session`, blob);

    this.resetCounters();
  }

  /**
   * Ends the session completely (clears intervals).
   */
  endSession() {
    this.syncNow();
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.activeDeckId = null;
  }

  ngOnDestroy() {
    this.endSession();
  }
}
