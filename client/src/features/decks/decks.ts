import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DeckService } from '../../core/services/deck.service';
import { Deck } from '../../core/models/deck.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageService } from '../../core/i18n/language.service';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { BottomNavComponent } from '../../layout/bottom-nav/bottom-nav';
import { DeckCardComponent } from '../../shared/components/deck-card/deck-card';

interface NewDeck {
  title: string;
  goal: string;
}

@Component({
  selector: 'app-decks',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, SidebarComponent, BottomNavComponent, DeckCardComponent],
  templateUrl: './decks.html',
  styleUrl: './decks.css',
})
export class Decks implements OnInit {
  isModalOpen = signal(false);
  deckService = inject(DeckService);
  langService = inject(LanguageService);

  decks: Deck[] = [];

  newDeck: NewDeck = { title: '', goal: '1 Week' };

  ngOnInit() {
    this.deckService.loadDecks().subscribe();
    this.deckService.decks$.subscribe(decks => {
      this.decks = decks;
    });
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.newDeck = { title: '', goal: '1 Week' };
  }

  onCreateDeck(): void {
    if (!this.newDeck.title.trim()) return;
    this.deckService.addDeck(this.newDeck.title, this.newDeck.goal).subscribe();
    this.closeModal();
  }

  onDeleteDeck(id: string): void {
    this.deckService.deleteDeck(id).subscribe();
  }

  // DeLeTe Modal
  isDeleteConfirmOpen = signal(false);
  isDeleteValidateOpen = signal(false);
  deckToDelete = signal<string | null>(null);
  deleteValidationText = '';

  confirmDeleteDeck(id: string): void {
    this.deckToDelete.set(id);
    this.isDeleteConfirmOpen.set(true);
  }

  proceedToDeleteValidation(): void {
    this.isDeleteConfirmOpen.set(false);
    this.isDeleteValidateOpen.set(true);
    this.deleteValidationText = '';
  }

  cancelDelete(): void {
    this.isDeleteConfirmOpen.set(false);
    this.isDeleteValidateOpen.set(false);
    this.deckToDelete.set(null);
    this.deleteValidationText = '';
  }

  executeDeleteDeck(): void {
    if (this.deleteValidationText === 'DeLeTe') {
      const id = this.deckToDelete();
      if (id) {
        this.deckService.deleteDeck(id).subscribe();
      }
      this.cancelDelete();
    } else {
      alert(this.langService.translate('decks.alert.type_delete'));
    }
  }
}