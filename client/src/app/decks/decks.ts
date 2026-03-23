import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DeckService } from '../_services/deck.service';
import { Deck } from '../_models/deck.model';
import { TranslatePipe } from '../_i18n/translate.pipe';
import { LanguageService } from '../_i18n/language.service';

interface NewDeck {
  title: string;
  goal: string;
}

@Component({
  selector: 'app-decks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
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
    this.deckService.addDeck(this.newDeck.title, this.newDeck.goal);
    this.closeModal();
  }

  onDeleteDeck(title: string): void {
    this.deckService.deleteDeck(title);
  }

  // DeLeTe Modal
  isDeleteConfirmOpen = signal(false);
  isDeleteValidateOpen = signal(false);
  deckToDelete = signal<string | null>(null);
  deleteValidationText = '';

  confirmDeleteDeck(title: string): void {
    this.deckToDelete.set(title);
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
      const title = this.deckToDelete();
      if (title) {
        this.deckService.deleteDeck(title);
      }
      this.cancelDelete();
    } else {
      alert(this.langService.translate('decks.alert.type_delete'));
    }
  }
}

