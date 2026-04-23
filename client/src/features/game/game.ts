import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { GameService } from '../../core/services/game-service';
import { LanguageService } from '../../core/i18n/language-service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './game.html',
})
export class GameComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public gameService = inject(GameService);
  public langService = inject(LanguageService);

  private deckId = this.route.snapshot.paramMap.get('id') || '';

  // UI-ONLY STATE
  isCardFlipped = signal(false);
  showProgressionModal = signal(false);

  // Selectors from Service
  deck = this.gameService.deck;
  activeBatch = this.gameService.activeBatch;
  currentRotationPointer = this.gameService.currentRotationPointer;
  activeRotation = this.gameService.activeRotation;
  currentStudyCard = this.gameService.currentStudyCard;
  isSelectionMode = this.gameService.isSelectionMode;

  ngOnInit() {
    this.gameService.startSession(this.deckId);
  }

  flipCard(): void {
    this.isCardFlipped.set(!this.isCardFlipped());
  }

  rateCard(rating: 'again' | 'hard' | 'good' | 'later' | 'mastered' | 'stay_next'): void {
    const shouldShowModal = this.gameService.rateCard(rating);

    if (shouldShowModal) {
      this.showProgressionModal.set(true);
    } else {
      this.isCardFlipped.set(false); // Next card: reset flip state
    }
  }

  handleProgressionChoice(choice: 'next' | 'stay'): void {
    this.showProgressionModal.set(false);
    this.isCardFlipped.set(false);
    this.gameService.handleProgressionChoice(choice);
  }

  closeGame(): void {
    this.gameService.endSession();
    this.router.navigate(['/decks', this.deckId]);
  }

  ngOnDestroy(): void {
    this.gameService.endSession();
  }
}
