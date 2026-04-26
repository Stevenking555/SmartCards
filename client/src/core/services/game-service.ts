/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { HomeService } from './home-service';
import { DeckService } from './deck-service';
import { DeckForUser, CardWithStats } from '../models/deck-models';

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

const RANK_UP_THRESHOLD = 1;

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  private http = inject(HttpClient);
  private homeService = inject(HomeService);
  private deckService = inject(DeckService);
  baseUrl = environment.apiUrl;

  // Session Tracking State
  private activeDeckId: string | null = null;
  private startTime: number = 0;
  private flippedCardsTotal: number = 0;
  private flippedCardsToday: number = 0;
  private cardUpdates: Map<string, CardSessionUpdateDto> = new Map();
  private autoSaveInterval: any;

  // Game Engine State (Reactive/Signals)
  gameData = signal<DeckForUser | undefined>(undefined);
  activeBatch = signal<number>(1);
  activeRotationIndex = signal<number>(0);
  isSelectionMode = signal(false);
  activeRotation = signal<CardWithStats[]>([]);
  currentRotationPointer = signal(0);

  private currentRankUpGoal = RANK_UP_THRESHOLD;
  private skipProgressionCheck = false;

  // Computed Selectors
  deck = computed(() => this.gameData()?.info);
  allCardsWithStats = computed(() => this.gameData()?.cards || []);
  currentStudyCard = computed(() => {
    const rotation = this.activeRotation();
    const pointer = this.currentRotationPointer();
    return rotation.length > 0 && pointer < rotation.length ? rotation[pointer] : undefined;
  });

  startSession(deckId: string) {
    this.activeDeckId = deckId;
    this.startTime = Date.now();
    this.flippedCardsTotal = 0;
    this.flippedCardsToday = 0;
    this.cardUpdates.clear();

    // Reset Engine State
    this.currentRankUpGoal = RANK_UP_THRESHOLD;
    this.skipProgressionCheck = false;
    this.isSelectionMode.set(false);

    // Load Data
    this.deckService.getOrLoadDeckForGame(deckId).subscribe((response: DeckForUser) => {
      if (response) {
        this.gameData.set(response);
        this.initializeBatches();
        this.startNewRotation();

        if (response.info) {
          this.deckService.addToLastPlayed(response);
        }
      }
    });

    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.autoSaveInterval = setInterval(() => this.syncNow(), 5 * 60 * 1000);
  }

  // --- Game Engine Logic ---

  private initializeBatches() {
    const data = this.gameData();
    if (!data || !data.cards || data.cards.length === 0) return;

    const cards = data.cards;
    const unassigned = cards.filter(c => c.stats.batchIndex === 0 && !c.stats.isMastered);
    if (unassigned.length === 0) return;

    // We want to fill batches up to 10 cards each, starting from Batch 1
    let currentBatch = 1;

    unassigned.forEach(card => {
      // Find the first batch that has fewer than 10 NON-MASTERED cards
      while (true) {
        const countActiveInCurrent = cards.filter(c => c.stats.batchIndex === currentBatch && !c.stats.isMastered).length;
        if (countActiveInCurrent < 10) {
          card.stats.batchIndex = currentBatch;
          this.trackCardUpdate(card.data.id, card.stats);
          break;
        }
        currentBatch++;
      }
    });
  }

  /**
   * Recalculates what the current active batch and rotation index should be
   * based on the CURRENT state of all cards.
   */
  private calculateActiveStates() {
    const nonMastered = this.allCardsWithStats().filter(c => !c.stats.isMastered);
    if (nonMastered.length === 0) {
      this.activeBatch.set(-1);
      this.activeRotationIndex.set(-1);
      return;
    }

    const minBatch = Math.min(...nonMastered.map(c => c.stats.batchIndex));
    this.activeBatch.set(minBatch);

    const cardsInBatch = nonMastered.filter(c => c.stats.batchIndex === minBatch);
    const minRotIndex = Math.min(...cardsInBatch.map(c => c.stats.rotationIndex));
    this.activeRotationIndex.set(minRotIndex);
  }

  private startNewRotation(): boolean {
    this.currentRotationPointer.set(0);

    this.calculateActiveStates();

    const batch = this.activeBatch();
    const rotIdx = this.activeRotationIndex();

    //Check for Game Over (all mastered)
    if (batch === -1) {
      this.activeRotation.set([]);
      return false;
    }

    //Check for Progression Modal (Level Up)
    if (!this.isSelectionMode() && !this.skipProgressionCheck && rotIdx >= this.currentRankUpGoal) {
      return true;
    }

    this.skipProgressionCheck = false;

    //Gather the cards for this specific rotation
    let rotationCards = this.allCardsWithStats().filter(c =>
      !c.stats.isMastered &&
      c.stats.batchIndex === batch &&
      c.stats.rotationIndex === rotIdx
    );

    if (rotationCards.length === 0) {
      this.calculateActiveStates();
      if (this.activeBatch() === -1) return false;
      return this.startNewRotation();
    }

    //Sort by points (weakest first) and update signal
    rotationCards.sort((a, b) => a.stats.rotationPoints - b.stats.rotationPoints);
    this.activeRotation.set(rotationCards);

    return false;
  }

  rateCard(rating: 'again' | 'hard' | 'good' | 'later' | 'mastered' | 'stay_next'): boolean {
    const currentCard = this.currentStudyCard();
    if (!currentCard) return false;

    if (this.isSelectionMode()) {
      this.handleSelectionRating(currentCard, rating as any);
    } else {
      this.recordCardInteraction(currentCard.data.id, rating as any, currentCard.stats);
    }

    return this.moveToNextInRotation();
  }

  handleProgressionChoice(choice: 'next' | 'stay') {
    if (choice === 'next') {
      // ENTER SELECTION MODE
      this.isSelectionMode.set(true);
      this.currentRotationPointer.set(0);

      // Get ALL non-mastered cards in the current batch for selection
      const batchCards = this.allCardsWithStats().filter(c =>
        !c.stats.isMastered &&
        c.stats.batchIndex === this.activeBatch()
      );

      this.activeRotation.set(batchCards);
    } else {
      // STAY AND REFINE
      this.currentRankUpGoal += 1;
      this.skipProgressionCheck = true;
      this.startNewRotation();
    }
  }

  private handleSelectionRating(card: CardWithStats, rating: 'stay_next' | 'later' | 'mastered') {
    let { batchIndex, rotationPoints, rotationIndex, isMastered } = card.stats;

    if (rating === 'stay_next') {
      batchIndex += 1;
      rotationPoints = 0;
      rotationIndex = 0;
    } else if (rating === 'later') {
      batchIndex += 2;
      rotationPoints = 0;
      rotationIndex = 0;
    } else if (rating === 'mastered') {
      isMastered = true;
      batchIndex = 0;
      rotationPoints = 0;
      rotationIndex = 0;
    }

    this.recordCardInteraction(card.data.id, 'manual', { batchIndex, rotationPoints, rotationIndex, isMastered });
  }

  private moveToNextInRotation(): boolean {
    const nextIdx = this.currentRotationPointer() + 1;

    // Check if we still have cards LEFT in the current list
    if (nextIdx < this.activeRotation().length) {
      this.currentRotationPointer.set(nextIdx);
      return false;
    } else {
      // END OF CURRENT LIST ATTAINED

      if (this.isSelectionMode()) {
        // Selection Mode just finished! 
        // We MUST reset state before calling startNewRotation
        this.isSelectionMode.set(false);
        this.currentRankUpGoal = RANK_UP_THRESHOLD;
        this.skipProgressionCheck = true;
      }

      // Start a fresh rotation based on the NEW batch indices and states
      return this.startNewRotation();
    }
  }

  // --- Data Sync Logic ---

  private recordCardInteraction(
    cardId: string,
    rating: 'again' | 'hard' | 'good' | 'later' | 'mastered' | 'manual',
    currentStats: { batchIndex: number, rotationPoints: number, rotationIndex: number, isMastered: boolean }
  ) {
    if (!this.activeDeckId) return;

    // Track total activity
    if (rating !== 'manual') {
      this.flippedCardsTotal++;
      this.flippedCardsToday++;
      this.homeService.incrementFlippedStats();
    }

    // Determine new stats
    let { batchIndex, rotationPoints, rotationIndex, isMastered } = { ...currentStats };

    if (rating === 'mastered') {
      isMastered = true;
      batchIndex = 0;
      rotationPoints = 0;
      rotationIndex = 0;
    } else if (rating === 'later') {
      rotationPoints = 0;
      rotationIndex = 0;
      batchIndex += 2;
    } else if (rating === 'manual') {
      // Stats were already prepared in handleSelectionRating, 
      // just destructuring them to ensure we have the local copies
      batchIndex = currentStats.batchIndex;
      rotationPoints = currentStats.rotationPoints;
      rotationIndex = currentStats.rotationIndex;
      isMastered = currentStats.isMastered;
    } else {
      const pointsToAdd = rating === 'again' ? 1 : (rating === 'hard' ? 2 : 3);
      const oldThreshold = Math.floor(rotationPoints / 10);
      rotationPoints += pointsToAdd;
      const newThreshold = Math.floor(rotationPoints / 10);
      if (newThreshold > oldThreshold) rotationIndex += (newThreshold - oldThreshold);
    }

    //Update the REAL data source (Signal)
    this.gameData.update(data => {
      if (data?.cards) {
        const cardToUpdate = data.cards.find(c => c.data.id === cardId);
        if (cardToUpdate) {
          cardToUpdate.stats.batchIndex = batchIndex;
          cardToUpdate.stats.rotationPoints = rotationPoints;
          cardToUpdate.stats.rotationIndex = rotationIndex;
          cardToUpdate.stats.isMastered = isMastered;
        }
      }
      return data;
    });

    this.trackCardUpdate(cardId, { batchIndex, rotationPoints, rotationIndex, isMastered });
  }

  private trackCardUpdate(cardId: string, stats: any) {
    this.cardUpdates.set(cardId, { cardId, ...stats });
  }

  private calculateTimeSpentMinutes(): number {
    if (this.startTime === 0) return 0;
    const diffMs = Date.now() - this.startTime;
    return Math.floor(diffMs / 60000);
  }

  private preparePayload(): UpdateSessionStatsDto | null {
    if (!this.activeDeckId) return null;
    const timeSpent = this.calculateTimeSpentMinutes();
    if (this.flippedCardsTotal === 0 && timeSpent === 0 && this.cardUpdates.size === 0) return null;

    return {
      deckId: this.activeDeckId,
      flippedCardsTotal: this.flippedCardsTotal,
      flippedCardsToday: this.flippedCardsToday,
      lastFlipAt: new Date().toISOString(),
      timeSpentMinutes: timeSpent,
      lastPlayedAt: new Date().toISOString(),
      cards: Array.from(this.cardUpdates.values())
    };
  }

  syncNow() {
    const payload = this.preparePayload();
    if (!payload) return;
    const deckIdSyncing = this.activeDeckId;

    this.http.post<any>(`${this.baseUrl}stats/session`, payload, { withCredentials: true }).subscribe({
      next: (result) => {
        this.resetCounters();
        if (result?.userStats) this.homeService.updateStats(result.userStats);
        if (result?.updatedDeckStats && deckIdSyncing) this.deckService.updateDeckStats(deckIdSyncing, result.updatedDeckStats);
      },
      error: (err) => console.error('Failed to sync study session', err)
    });
  }

  syncOnUnload() {
    const payload = this.preparePayload();
    if (!payload) return;
    navigator.sendBeacon(`${this.baseUrl}stats/session`, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    this.resetCounters();
  }

  private resetCounters() {
    this.startTime = Date.now();
    this.flippedCardsTotal = 0;
    this.flippedCardsToday = 0;
    this.cardUpdates.clear();
  }

  endSession() {
    this.syncNow();
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.activeDeckId = null;
    this.gameData.set(undefined);
  }

  ngOnDestroy() {
    this.endSession();
  }
}

