import { Component, signal, inject, OnInit, OnDestroy, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DeckService } from '../../../core/services/deck-service';
import { HomeService } from '../../../core/services/home-service';
import { Deck, Card, DeckForUser, CardWithStats, CreateCardDto, SyncCardsDto } from '../../../core/models/deck-models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../core/i18n/language-service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar';
import { BottomNavComponent } from '../../../layout/bottom-nav/bottom-nav';
import { FlashcardComponent } from '../../../shared/components/flashcard/flashcard';
import { Subject, takeUntil, of, tap, Observable } from 'rxjs';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, SidebarComponent, BottomNavComponent, FlashcardComponent],
  templateUrl: './deck-detail.html',
})
export class DeckDetailComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  deckService = inject(DeckService);
  langService = inject(LanguageService);
  homeService = inject(HomeService);
  private destroy$ = new Subject<void>();

  deckId = this.route.snapshot.paramMap.get('id') || '';
  currentDeck = signal<DeckForUser | null>(null);

  // Sync Tracking
  private addedCards: CreateCardDto[] = [];
  private updatedCards: Card[] = [];
  private deletedCardIds: string[] = [];
  private hasChanges = false;

  deck = computed(() => this.currentDeck()?.info);
  cards = computed(() => this.currentDeck()?.cards?.map(cw => cw.data) || []);

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
    return id ? this.cards().find(c => c.id === id) ?? null : null;
  }

  // Edit mode
  router = inject(Router);
  isEditingTitle = signal(false);
  editTitleValue = '';
  isEditingDescription = signal(false);
  editDescriptionValue = '';
  isDescriptionExpanded = signal(false);

  ngOnInit() {
    this.deckService.getOrLoadDeckForGame(this.deckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.currentDeck.set(data);
        this.deckService.addToLastEdited(data);
      });
  }

  ngOnDestroy() {
    if (this.hasChanges) {
      this.syncChanges().subscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    // We let this be for now as requested
  }

  private syncChanges(): Observable<any> {
    if (!this.hasChanges) return of(null);

    const syncDto: SyncCardsDto = {
      addedCards: this.addedCards,
      updatedCards: this.updatedCards,
      deletedCardIds: this.deletedCardIds
    };

    console.log('Syncing cards...', syncDto);
    return this.deckService.syncCards(this.deckId, syncDto).pipe(
      tap({
        next: (fullDeck) => {
          if (fullDeck) this.currentDeck.set(fullDeck);
          this.addedCards = [];
          this.updatedCards = [];
          this.deletedCardIds = [];
          this.hasChanges = false;
        }
      })
    );
  }

  startStudy(): void {
    if (this.hasChanges) {
      this.syncChanges().subscribe(() => {
        this.router.navigate(['/decks', this.deckId, 'game']);
      });
    } else {
      this.router.navigate(['/decks', this.deckId, 'game']);
    }
  }

  onCreateCard(): void {
    if (this.deck() && this.newCard.question?.trim() && this.newCard.answer?.trim()) {
      const tempId = 'temp-' + Math.random();
      const cardDto: CreateCardDto = {
        question: this.newCard.question,
        answer: this.newCard.answer,
        tempId: tempId
      };

      this.currentDeck.update(current => {
        if (current) {
          const tempCard: CardWithStats = {
            data: { id: tempId, ...cardDto },
            stats: { batchIndex: 0, rotationPoints: 0, rotationIndex: 0, isMastered: false }
          };
          const newVal = {
            ...current,
            cards: [tempCard, ...(current.cards || [])]
          };
          this.deckService.updateDeckCardsLocally(this.deckId, newVal.cards!);
          return newVal;
        }
        return current;
      });

      this.addedCards.push(cardDto);
      this.hasChanges = true;
      this.homeService.updateCardCount(1); // Update global count
      this.closeModal();
    }
  }

  onDeleteCard(id: string): void {
    const current = this.currentDeck();
    if (current && current.cards) {
      if (id.startsWith('temp-')) {
        this.addedCards = this.addedCards.filter(c => c.tempId !== id);
      } else {
        this.deletedCardIds.push(id);
        this.updatedCards = this.updatedCards.filter(c => c.id !== id);
      }

      this.currentDeck.update(val => {
        if (val && val.cards) {
          const newVal = {
            ...val,
            cards: val.cards.filter(c => c.data.id !== id)
          };
          this.deckService.updateDeckCardsLocally(this.deckId, newVal.cards);
          return newVal;
        }
        return val;
      });
      this.hasChanges = true;
      this.homeService.updateCardCount(-1);
    }
  }

  onSaveEditCard(): void {
    const cardId = this.editingCardId();
    if (cardId && this.editCard.question.trim() && this.editCard.answer.trim()) {
      this.currentDeck.update(current => {
        if (current && current.cards) {
          const idx = current.cards.findIndex((c: CardWithStats) => c.data.id === cardId);
          if (idx !== -1) {
            const updatedCard = { ...current.cards[idx].data, ...this.editCard };
            current.cards[idx].data = updatedCard;

            if (!cardId.startsWith('temp-')) {
              this.updatedCards = this.updatedCards.filter(c => c.id !== cardId);
              this.updatedCards.push(updatedCard);
            } else {
              const cardToDelete = current.cards[idx];
              const tempIdx = this.addedCards.findIndex(c => c.question === cardToDelete.data.question);
              if (tempIdx !== -1) this.addedCards[tempIdx] = { ...this.editCard };
            }
            this.hasChanges = true;
            const newVal = { ...current, cards: [...current.cards] };
            this.deckService.updateDeckCardsLocally(this.deckId, newVal.cards);
            return newVal;
          }
        }
        return current;
      });
    }
    /* 
    // OLD IMMEDIATE SYNC METHOD (Keep for reference):
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
    */
    this.closeEditModal();
  }

  // Modal Handlers
  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.newCard = { question: '', answer: '' };
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
    if (cardId) {
      this.openEditModal(cardId);
    }
  }

  deleteFromView(): void {
    const cardId = this.viewingCardId();
    this.closeViewModal();
    if (cardId) {
      this.onDeleteCard(cardId);
    }
  }

  openEditModal(cardId: string): void {
    const card = this.cards().find(c => c.id === cardId);
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

  // Title Editing
  startEditTitle(): void {
    if (this.deck()) {
      this.editTitleValue = this.deck()!.title;
      this.isEditingTitle.set(true);
    }
  }

  saveTitle(): void {
    const newTitle = this.editTitleValue.trim();
    if (this.deck() && newTitle && newTitle !== this.deck()!.title) {
      this.deckService.updateDeck(this.deckId, { title: newTitle, description: this.deck()!.description }).subscribe({
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
    if (this.deck()) {
      this.editDescriptionValue = this.deck()!.description || '';
      this.isEditingDescription.set(true);
    }
  }

  saveDescription(): void {
    const newDesc = this.editDescriptionValue.trim();
    if (this.deck() && newDesc !== (this.deck()!.description || '')) {
      this.deckService.updateDeck(this.deckId, { title: this.deck()!.title, description: newDesc }).subscribe({
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

  private refreshDeckData(): void {
    this.deckService.getDeckWithCards(this.deckId).subscribe(data => {
      this.currentDeck.set(data);
    });
  }

  // Card Import
  isImportModalOpen = signal(false);
  importTab = signal<'paste' | 'upload'>('paste');
  importBulkText = signal('');
  importFileName = signal<string | null>(null);

  openImportModal(): void {
    this.isImportModalOpen.set(true);
    this.importBulkText.set('');
    this.importFileName.set(null);
  }

  closeImportModal(): void {
    this.isImportModalOpen.set(false);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.importFileName.set(file.name);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.importBulkText.set(e.target.result);
      };
      reader.readAsText(file);
    }
  }

  removeFile(): void {
    this.importFileName.set(null);
    this.importBulkText.set('');
  }

  onImportCards(): void {
    const text = this.importBulkText().trim();
    if (text) {
      // Sync manual changes first to prevent data loss before import
      if (this.hasChanges) {
        this.syncChanges().subscribe({
          next: () => this.executeImport(text)
        });
      } else {
        this.executeImport(text);
      }
    }
  }

  private executeImport(text: string): void {
    this.deckService.importCards(this.deckId, text).subscribe({
      next: (result) => {
        if (result.isSuccess) {
          this.refreshDeckData();
          this.closeImportModal();
        } else {
          alert('Import failed: ' + (result.failedLines?.join(', ') || 'Unknown error'));
        }
      },
      error: () => {
        alert('Error during import!');
      }
    });
  }
}
