import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { DeckService } from '../../core/services/deck.service';
import { StudySessionService } from '../../core/services/study-session.service';
import { LanguageService } from '../../core/i18n/language.service';
import { Deck, Card } from '../../core/models/deck.model';

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
  studyService = inject(StudySessionService);
  langService = inject(LanguageService);

  deckId = this.route.snapshot.paramMap.get('id') || '';
  deck: Deck | undefined;

  currentStudyCardIndex = signal(0);
  isCardFlipped = signal(false);

  ngOnInit() {
    this.deckService.loadDecks().subscribe(() => {
      this.deck = this.deckService.getDeckById(this.deckId);
      if (this.deck && this.deck.id) {
        // Load cards with stats specifically for the game
        this.deckService.getDeckForGame(this.deck.id).subscribe(response => {
          if (this.deck && response) {
            this.deck.cards = response.cards;
            this.studyService.startSession(this.deck.id);
          }
        });
      }
    });
  }

  closeGame(): void {
    this.router.navigate(['/decks', this.deckId]);
  }

  flipCard(): void {
    this.isCardFlipped.set(!this.isCardFlipped());
  }

  rateCard(rating: 'again' | 'hard' | 'good' | 'easy'): void {
    if (this.deck && this.currentStudyCard) {
      this.studyService.recordCardInteraction(this.currentStudyCard.id, rating);

      const nextIndex = this.currentStudyCardIndex() + 1;
      const cardsLength = this.deck.cards?.length || 0;

      if (nextIndex < cardsLength) {
        this.currentStudyCardIndex.set(nextIndex);
        this.isCardFlipped.set(false);
      } else {
        alert(this.langService.translate('deck_detail.alert.finished_studying'));
        this.closeGame();
      }
    }
  }

  get currentStudyCard(): Card | undefined {
    if (this.deck && this.deck.cards && this.deck.cards.length > 0) {
      return this.deck.cards[this.currentStudyCardIndex()];
    }
    return undefined;
  }

  ngOnDestroy(): void {
    // Relying on StudySessionService's own ngOnDestroy or explicit endSession isn't enough
    // because StudySessionService is providedIn: 'root'. 
    // We must manually trigger a sync here when user navigates away.
    this.studyService.syncNow();
  }
}
