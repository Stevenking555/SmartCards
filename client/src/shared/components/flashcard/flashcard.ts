import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Card } from '../../../core/models/deck.model';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './flashcard.html',
})
export class FlashcardComponent {
  @Input({ required: true }) card!: Card;

  @Output() saveCard = new EventEmitter<{ question: string, answer: string }>();
  @Output() deleteCard = new EventEmitter<void>();

  isEditing = signal(false);
  editQuestion = signal('');
  editAnswer = signal('');

  startEdit(event: Event): void {
    event.stopPropagation();
    this.editQuestion.set(this.card.question);
    this.editAnswer.set(this.card.answer);
    this.isEditing.set(true);
  }

  save(event: Event): void {
    event.stopPropagation();
    const q = this.editQuestion().trim();
    const a = this.editAnswer().trim();
    if (q && a) {
      this.saveCard.emit({ question: q, answer: a });
    }
    this.isEditing.set(false);
  }

  cancelEdit(event: Event): void {
    event.stopPropagation();
    this.isEditing.set(false);
  }

  delete(event: Event): void {
    event.stopPropagation();
    this.deleteCard.emit();
  }
}
