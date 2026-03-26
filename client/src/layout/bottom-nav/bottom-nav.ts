import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './bottom-nav.html',
})
export class BottomNavComponent {
  @Input() showFab = false;
  @Output() fabClick = new EventEmitter<void>();

  onFabClick() {
    this.fabClick.emit();
  }
}
