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
import { FlashcardComponent } from '../../../shared/components/flashcard/flashcard';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, SidebarComponent, BottomNavComponent, FlashcardComponent],
  templateUrl: './deck-detail.html',
})
export class DeckDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  deckService = inject(DeckService);
  langService = inject(LanguageService);

  deckId = this.route.snapshot.paramMap.get('id') || '';
  deck: Deck | undefined;

  isModalOpen = signal(false);
  newCard = { question: '', answer: '' };

  // Edit mode
  router = inject(Router);
  isEditingTitle = signal(false);
  editTitleValue = '';

  ngOnInit() {
    this.deckService.loadDecks().subscribe(() => {
      this.deckService.loadDeckWithCards(this.deckId).subscribe(() => {
        this.deck = this.deckService.getDeckById(this.deckId);
      });
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
    if (this.deck) {
      this.deckService.addCardToDeck(this.deckId, {
        question: this.newCard.question,
        answer: this.newCard.answer
      }).subscribe();
    }
    this.closeModal();
  }

  onDeleteCard(id: string): void {
    if (this.deck) {
      this.deckService.deleteCard(this.deckId, id).subscribe();
    }
  }

  // â”€â”€ Title Editing â”€â”€
  startEditTitle(): void {
    if (this.deck) {
      this.editTitleValue = this.deck.title;
      this.isEditingTitle.set(true);
    }
  }

  saveTitle(): void {
    const newTitle = this.editTitleValue.trim();
    if (this.deck && newTitle && newTitle !== this.deck.title) {
      this.deckService.updateDeckTitle(this.deckId, newTitle).subscribe({
        next: () => {
          if (this.deck) this.deck.title = newTitle;
          this.isEditingTitle.set(false);
        },
        error: () => {
          alert('Invalid or duplicate deck title!');
        }
      });
    } else {
      this.isEditingTitle.set(false);
    }
  }

  cancelEditTitle(): void {
    this.isEditingTitle.set(false);
  }

  // â”€â”€ Card Editing (Via FlashcardComponent) â”€â”€
  onUpdateCard(cardId: string, updatedData: { question: string, answer: string }): void {
    if (this.deck) {
      this.deckService.updateCard(this.deckId, cardId, updatedData).subscribe();
    }
  }
}