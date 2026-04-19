import { Component, OnInit, signal, inject, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { DeckService } from '../../core/services/deck-service';
import { GameService } from '../../core/services/game-service';
import { LanguageService } from '../../core/i18n/language-service';
import { Deck, Card, DeckForUser, CardWithStats } from '../../core/models/deck-models';

const RANK_UP_THRESHOLD = 1;

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './game.html',
})
export class GameComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  deckService = inject(DeckService);
  gameService = inject(GameService);
  langService = inject(LanguageService);

  deckId = this.route.snapshot.paramMap.get('id') || '';
  gameData: DeckForUser | undefined;

  // State Management
  activeBatch = signal<number>(1);
  activeRotationIndex = signal<number>(0);
  isSelectionMode = signal(false);
  showProgressionModal = signal(false);
  
  // The cards currently in the "loop"
  activeRotation = signal<CardWithStats[]>([]);
  currentRotationPointer = signal(0);
  isCardFlipped = signal(false);

  private currentRankUpGoal = RANK_UP_THRESHOLD;

  get deck(): Deck | undefined {
    return this.gameData?.info;
  }

  get allCardsWithStats(): CardWithStats[] {
    return this.gameData?.cards || [];
  }

  get currentStudyCard(): CardWithStats | undefined {
    const rotation = this.activeRotation();
    if (rotation.length > 0) {
      return rotation[this.currentRotationPointer()];
    }
    return undefined;
  }

  ngOnInit() {
    this.deckService.getOrLoadDeckForGame(this.deckId).subscribe(response => {
      if (response) {
        this.gameData = response;
        this.initializeBatches();
        this.startNewRotation();
        this.gameService.startSession(this.deckId);
      }
    });
  }

  /**
   * Assigns batchIndex to cards if they don't have one or if it's a brand new deck.
   */
  private initializeBatches() {
    if (!this.gameData) return;

    const cards = this.allCardsWithStats;
    if (cards.length === 0) return;

    const timeSpent = this.gameData.stats.timeSpentMinutes;
    const isNewDeck = timeSpent === 0;

    if (isNewDeck) {
      cards.forEach((c, i) => {
        c.stats.batchIndex = Math.floor(i / 10) + 1;
        this.gameService.updateCardStats(c.data.id, c.stats);
      });
    } else {
      const unassigned = cards.filter(c => c.stats.batchIndex === 0);
      if (unassigned.length > 0) {
        let maxBatch = Math.max(...cards.map(c => c.stats.batchIndex));
        if (maxBatch === 0) maxBatch = 1;

        let countInMax = cards.filter(c => c.stats.batchIndex === maxBatch).length;

        unassigned.forEach(c => {
          if (countInMax < 10) {
            c.stats.batchIndex = maxBatch;
            countInMax++;
          } else {
            maxBatch++;
            c.stats.batchIndex = maxBatch;
            countInMax = 1;
          }
          this.gameService.updateCardStats(c.data.id, c.stats);
        });
      }
    }
  }

  /**
   * Finds the current active batch and rotation index based on remaining cards.
   */
  private calculateActiveStates() {
    const nonMastered = this.allCardsWithStats.filter(c => !c.stats.isMastered);
    if (nonMastered.length === 0) {
      this.activeRotation.set([]);
      return;
    }

    const minBatch = Math.min(...nonMastered.map(c => c.stats.batchIndex));
    this.activeBatch.set(minBatch);

    const cardsInBatch = nonMastered.filter(c => c.stats.batchIndex === minBatch);
    const minRotIndex = Math.min(...cardsInBatch.map(c => c.stats.rotationIndex));
    this.activeRotationIndex.set(minRotIndex);
  }

  /**
   * Populates activeRotation with cards from the current batch and rotationIndex.
   */
  private startNewRotation() {
    this.calculateActiveStates();
    
    if (this.allCardsWithStats.filter(c => !c.stats.isMastered).length === 0) {
      return; // Finished all
    }

    const batch = this.activeBatch();
    const rotIdx = this.activeRotationIndex();

    // Check for batch progression if all cards in current batch reached the goal rank
    if (!this.isSelectionMode() && rotIdx >= this.currentRankUpGoal) {
      this.showProgressionModal.set(true);
      return;
    }

    let rotationCards = this.allCardsWithStats.filter(c => 
      !c.stats.isMastered && 
      c.stats.batchIndex === batch && 
      c.stats.rotationIndex === rotIdx
    );

    // If suddenly empty (e.g. all Mastered), recalculate
    if (rotationCards.length === 0) {
       this.calculateActiveStates();
       this.startNewRotation();
       return;
    }

    rotationCards.sort((a, b) => a.stats.rotationPoints - b.stats.rotationPoints);
    
    this.activeRotation.set(rotationCards);
    this.currentRotationPointer.set(0);
    this.isCardFlipped.set(false);
  }

  handleProgressionChoice(choice: 'next' | 'stay') {
    this.showProgressionModal.set(false);
    if (choice === 'next') {
      this.isSelectionMode.set(true);
      const batchCards = this.allCardsWithStats.filter(c => !c.stats.isMastered && c.stats.batchIndex === this.activeBatch());
      this.activeRotation.set(batchCards);
      this.currentRotationPointer.set(0);
      this.isCardFlipped.set(false);
    } else {
      this.currentRankUpGoal += 1; // Increase goal and continue refining
      this.startNewRotation();
    }
  }

  rateCard(rating: 'again' | 'hard' | 'good' | 'later' | 'mastered' | 'stay_next'): void {
    const currentCard = this.currentStudyCard;
    if (!currentCard) return;

    if (this.isSelectionMode()) {
       this.handleSelectionRating(currentCard, rating as any);
       return;
    }

    const newStats = this.gameService.recordCardInteraction(currentCard.data.id, rating as any, currentCard.stats);
    if (newStats) {
      Object.assign(currentCard.stats, newStats);
    }

    this.moveToNextInRotation();
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
    }

    const updated = this.gameService.recordCardInteraction(card.data.id, 'manual', { batchIndex, rotationPoints, rotationIndex, isMastered });
    Object.assign(card.stats, updated || { batchIndex, rotationPoints, rotationIndex, isMastered });

    this.moveToNextInRotation();
  }

  private moveToNextInRotation() {
    const nextIdx = this.currentRotationPointer() + 1;
    if (nextIdx < this.activeRotation().length) {
      this.currentRotationPointer.set(nextIdx);
      this.isCardFlipped.set(false);
    } else {
      if (this.isSelectionMode()) {
        const remainingInThisBatch = this.activeRotation().length - (this.currentRotationPointer() + 1);
        if (remainingInThisBatch <= 0) {
           this.isSelectionMode.set(false);
           this.currentRankUpGoal = RANK_UP_THRESHOLD;
        }
      }
      this.startNewRotation();
    }
  }

  flipCard(): void {
    this.isCardFlipped.set(!this.isCardFlipped());
  }

  closeGame(): void {
    this.router.navigate(['/decks', this.deckId]);
  }

  ngOnDestroy(): void {
    this.gameService.syncNow();
  }
}
