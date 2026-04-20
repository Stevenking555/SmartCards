import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { HomeService } from './home-service';
import { DeckService } from './deck-service';
import { UserStats } from '../models/user-models';

export interface CardSessionUpdateDto {
  cardId: string;
  batchIndex: number;
  rotationPoints: number;
  rotationIndex: number;
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
export class GameService implements OnDestroy {
  private http = inject(HttpClient);
  private homeService = inject(HomeService);
  private deckService = inject(DeckService);
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

    // Locally move to top of last played list
    const deck = this.deckService.getDeckById(deckId);
    if (deck) {
      this.deckService.addToLastPlayed(deck);
    }

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
   * Records a card flip and rating based on the new game logic.
   */
  recordCardInteraction(
    cardId: string,
    rating: 'again' | 'hard' | 'good' | 'later' | 'mastered' | 'manual',
    currentStats: { batchIndex: number, rotationPoints: number, rotationIndex: number, isMastered: boolean }
  ) {
    if (!this.activeDeckId) return;

    this.flippedCardsTotal++;
    this.flippedCardsToday++;
    this.homeService.incrementFlippedStats();

    // Start with existing recorded updates or provided current state
    const existing = this.cardUpdates.get(cardId) || {
      cardId: cardId,
      batchIndex: currentStats.batchIndex,
      rotationPoints: currentStats.rotationPoints,
      rotationIndex: currentStats.rotationIndex,
      isMastered: currentStats.isMastered
    };

    let { batchIndex, rotationPoints, rotationIndex, isMastered } = existing;

    if (rating === 'mastered') {
      isMastered = true;
    } else if (rating === 'later') {
      rotationPoints = 0;
      rotationIndex = 0;
      batchIndex += 2; // Move far ahead
    } else if (rating === 'manual') {
      // Stats already assigned from currentStats/existing, just recording the flip
    } else {
      // Numerical ratings
      // "Nem tudtam" -> again (1), "Nehezen" -> hard (2), "Könnyen" -> good (3)
      const pointsToAdd = rating === 'again' ? 1 : (rating === 'hard' ? 2 : 3);

      const oldThreshold = Math.floor(rotationPoints / 10);
      rotationPoints += pointsToAdd;
      const newThreshold = Math.floor(rotationPoints / 10);

      // Rule: If rotationPoints crosses a 10-count boundary (10, 20...), increase rotationIndex
      if (newThreshold > oldThreshold) {
        rotationIndex += (newThreshold - oldThreshold);
      }
    }

    this.cardUpdates.set(cardId, {
      cardId,
      batchIndex,
      rotationPoints,
      rotationIndex,
      isMastered
    });

    return { batchIndex, rotationPoints, rotationIndex, isMastered };
  }

  /**
   * Manually updates a card's statistics in the sync queue.
   */
  updateCardStats(cardId: string, stats: { batchIndex: number, rotationPoints: number, rotationIndex: number, isMastered: boolean }) {
    this.cardUpdates.set(cardId, {
      cardId,
      ...stats
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

    const deckIdSyncing = this.activeDeckId; // Capture the current deck ID

    this.http.post<any>(`${this.baseUrl}stats/session`, payload, { withCredentials: true }).subscribe({
      next: (result) => {
        this.resetCounters();
        if (result && result.userStats) {
          this.homeService.updateStats(result.userStats);
        }
        if (result && result.updatedDeckStats && deckIdSyncing) {
          this.deckService.updateDeckStats(deckIdSyncing, result.updatedDeckStats);
        }
      },
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
