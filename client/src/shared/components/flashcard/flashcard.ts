import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Card } from '../../../core/models/deck-models';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './flashcard.html',
})
export class FlashcardComponent {
  @Input({ required: true }) card!: Card;

  @Output() viewCard = new EventEmitter<void>();
  @Output() editCard = new EventEmitter<void>();
  @Output() deleteCard = new EventEmitter<void>();

  onView(): void {
    this.viewCard.emit();
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.editCard.emit();
  }

  delete(event: Event): void {
    event.stopPropagation();
    this.deleteCard.emit();
  }
}
