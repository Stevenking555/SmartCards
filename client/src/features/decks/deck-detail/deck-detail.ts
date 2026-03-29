import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DeckService } from '../../../core/services/deck.service';
import { Deck, Card } from '../../../core/models/deck.model';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../core/i18n/language.service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar';
import { BottomNavComponent } from '../../../layout/bottom-nav/bottom-nav';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, SidebarComponent, BottomNavComponent],
  templateUrl: './deck-detail.html',
})
export class DeckDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  deckService = inject(DeckService);
  langService = inject(LanguageService);
  
  deckTitle = this.route.snapshot.paramMap.get('id') || 'Deck';
  deck: Deck | undefined;

  isModalOpen = signal(false);
  newCard = { question: '', answer: '' };

  // Edit mode
  router = inject(Router);
  isEditingTitle = signal(false);
  editTitleValue = signal('');
  
  editingCardId = signal<string | null>(null);
  editCardQuestion = signal('');
  editCardAnswer = signal('');

  // Study mode
  isStudyModeOpen = signal(false);
  currentStudyCardIndex = signal(0);
  isCardFlipped = signal(false);

  ngOnInit() {
    this.deckService.decks$.subscribe(() => {
      this.deck = this.deckService.getDeckByTitle(this.deckTitle);
    });
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.newCard = { question: '', answer: '' };
  }

  onCreateCard(): void {
    if (!this.newCard.question.trim() || !this.newCard.answer.trim()) return;
    this.deckService.addCardToDeck(this.deckTitle, {
      question: this.newCard.question,
      answer: this.newCard.answer
    });
    this.closeModal();
  }

  onDeleteCard(id: string): void {
    this.deckService.deleteCard(this.deckTitle, id);
  }

  // â”€â”€ Title Editing â”€â”€
  startEditTitle(): void {
    if (this.deck) {
      this.editTitleValue.set(this.deck.title);
      this.isEditingTitle.set(true);
    }
  }

  saveTitle(): void {
    const newTitle = this.editTitleValue().trim();
    if (this.deck && newTitle && newTitle !== this.deckTitle) {
      const oldTitle = this.deckTitle;
      this.deckTitle = newTitle; // Update local tracker before service triggers observable
      const success = this.deckService.updateDeckTitle(oldTitle, newTitle);
      if (success) {
        this.isEditingTitle.set(false);
        this.router.navigate(['/decks', newTitle]);
      } else {
        this.deckTitle = oldTitle; // Revert if failed
        alert('Invalid or duplicate deck title!');
      }
    } else {
      this.isEditingTitle.set(false);
    }
  }

  cancelEditTitle(): void {
    this.isEditingTitle.set(false);
  }

  // â”€â”€ Card Editing â”€â”€
  startEditCard(card: Card, event: Event): void {
    event.stopPropagation();
    this.editingCardId.set(card.id);
    this.editCardQuestion.set(card.question);
    this.editCardAnswer.set(card.answer);
  }

  saveCard(cardId: string, event: Event): void {
    event.stopPropagation();
    const q = this.editCardQuestion().trim();
    const a = this.editCardAnswer().trim();
    if (q && a) {
      this.deckService.updateCard(this.deckTitle, cardId, { question: q, answer: a });
    }
    this.editingCardId.set(null);
  }

  cancelEditCard(event: Event): void {
    event.stopPropagation();
    this.editingCardId.set(null);
  }

  // â”€â”€ Study Mode logic â”€â”€
  openStudyMode(): void {
    if (this.deck && this.deck.cards.length > 0) {
      this.currentStudyCardIndex.set(0);
      this.isCardFlipped.set(false);
      this.isStudyModeOpen.set(true);
    }
  }

  closeStudyMode(): void {
    this.isStudyModeOpen.set(false);
  }

  flipCard(): void {
    this.isCardFlipped.set(!this.isCardFlipped());
  }

  rateCard(rating: string): void {
    // Basic logic to move to the next card after rating
    if (this.deck) {
      const nextIndex = this.currentStudyCardIndex() + 1;
      if (nextIndex < this.deck.cards.length) {
        this.currentStudyCardIndex.set(nextIndex);
        this.isCardFlipped.set(false);
      } else {
        // Study session complete
        this.closeStudyMode();
        alert(this.langService.translate('deck_detail.alert.finished_studying'));
      }
    }
  }

  get currentStudyCard(): Card | undefined {
    if (this.deck && this.deck.cards.length > 0) {
      return this.deck.cards[this.currentStudyCardIndex()];
    }
    return undefined;
  }
}



