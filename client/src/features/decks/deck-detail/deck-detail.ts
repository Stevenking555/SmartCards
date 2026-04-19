import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DeckService } from '../../../core/services/deck-service';
import { Deck, Card, DeckForUser, CardWithStats } from '../../../core/models/deck-models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../core/i18n/language-service';
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

  currentDeck = signal<DeckForUser | null>(null);

  get deck(): Deck | undefined {
    return this.currentDeck()?.info;
  }

  get cards(): Card[] {
    return this.currentDeck()?.cards?.map(cw => cw.data) || [];
  }

  isModalOpen = signal(false);
  newCard = { question: '', answer: '' };

  // Edit card modal
  isEditModalOpen = signal(false);
  editingCardId = signal<string | null>(null);
  editCard = { question: '', answer: '' };

  // View card modal
  isViewModalOpen = signal(false);
  viewingCardId = signal<string | null>(null);

  get viewingCard() {
    const id = this.viewingCardId();
    return id ? this.cards.find(c => c.id === id) ?? null : null;
  }

  // Edit mode
  router = inject(Router);
  isEditingTitle = signal(false);
  editTitleValue = '';
  isEditingDescription = signal(false);
  editDescriptionValue = '';
  isDescriptionExpanded = signal(false);

  ngOnInit() {
    this.deckService.getOrLoadDeckForGame(this.deckId).subscribe(data => {
      this.currentDeck.set(data);
      this.deckService.addToLastEdited(data);
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
      }).subscribe(newCardWithStats => {
        const current = this.currentDeck();
        if (current) {
          if (!current.cards) current.cards = [];
          current.cards.push(newCardWithStats);
          this.currentDeck.set({ ...current });
        }
      });
    }
    this.closeModal();
  }

  onDeleteCard(id: string): void {
    if (this.deck) {
      this.deckService.deleteCard(this.deckId, id).subscribe(() => {
        const current = this.currentDeck();
        if (current && current.cards) {
          current.cards = current.cards.filter((c: CardWithStats) => c.data.id !== id);
          this.currentDeck.set({ ...current });
        }
      });
    }
  }

  openViewModal(cardId: string): void {
    this.viewingCardId.set(cardId);
    this.isViewModalOpen.set(true);
  }

  closeViewModal(): void {
    this.isViewModalOpen.set(false);
    this.viewingCardId.set(null);
  }

  editFromView(): void {
    const cardId = this.viewingCardId();
    this.closeViewModal();
    if (cardId) this.openEditModal(cardId);
  }

  deleteFromView(): void {
    const cardId = this.viewingCardId();
    this.closeViewModal();
    if (cardId) this.onDeleteCard(cardId);
  }

  openEditModal(cardId: string): void {
    const card = this.cards.find(c => c.id === cardId);
    if (card) {
      this.editCard = { question: card.question, answer: card.answer };
      this.editingCardId.set(cardId);
      this.isEditModalOpen.set(true);
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.editingCardId.set(null);
    this.editCard = { question: '', answer: '' };
  }

  onSaveEditCard(): void {
    const cardId = this.editingCardId();
    if (cardId && this.editCard.question.trim() && this.editCard.answer.trim()) {
      this.deckService.updateCard(this.deckId, cardId, this.editCard).subscribe(updatedCard => {
        const current = this.currentDeck();
        if (current && current.cards) {
          const idx = current.cards.findIndex((c: CardWithStats) => c.data.id === cardId);
          if (idx !== -1) {
            current.cards[idx].data = updatedCard;
            this.currentDeck.set({ ...current });
          }
        }
      });
    }
    this.closeEditModal();
  }

  // Title Editing
  startEditTitle(): void {
    if (this.deck) {
      this.editTitleValue = this.deck.title;
      this.isEditingTitle.set(true);
    }
  }

  saveTitle(): void {
    const newTitle = this.editTitleValue.trim();
    if (this.deck && newTitle && newTitle !== this.deck.title) {
      this.deckService.updateDeck(this.deckId, { title: newTitle, description: this.deck.description }).subscribe({
        next: () => {
          const current = this.currentDeck();
          if (current) {
            current.info.title = newTitle;
            this.currentDeck.set({ ...current });
          }
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

  // Description Editing
  toggleDescriptionExpand(): void {
    if (!this.isEditingDescription()) {
      this.isDescriptionExpanded.update(v => !v);
    }
  }

  startEditDescription(): void {
    if (this.deck) {
      this.editDescriptionValue = this.deck.description || '';
      this.isEditingDescription.set(true);
    }
  }

  saveDescription(): void {
    const newDesc = this.editDescriptionValue.trim();
    if (this.deck && newDesc !== (this.deck.description || '')) {
      this.deckService.updateDeck(this.deckId, { title: this.deck.title, description: newDesc }).subscribe({
        next: () => {
          const current = this.currentDeck();
          if (current) {
            current.info.description = newDesc;
            this.currentDeck.set({ ...current });
          }
          this.isEditingDescription.set(false);
        },
        error: () => {
          alert('Error updating description!');
        }
      });
    } else {
      this.isEditingDescription.set(false);
    }
  }

  cancelEditDescription(): void {
    this.isEditingDescription.set(false);
  }

}


