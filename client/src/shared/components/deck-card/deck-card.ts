import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { DeckForUser } from '../../../core/models/deck-models';

@Component({
  selector: 'app-deck-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './deck-card.html',
})
export class DeckCardComponent {
  @Input({ required: true }) item!: DeckForUser;
  @Input() layout: 'mobile' | 'desktop' = 'desktop';
  @Input() showDelete: boolean = true;
  @Input() showProgress: boolean = true;

  @Output() delete = new EventEmitter<string>();

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.item.info.id);
  }
}
