import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DeckService } from '../_services/deck.service';
import { TranslatePipe } from '../_i18n/translate.pipe';

import { AccountService } from '../_services/account-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  deckService = inject(DeckService);
  accountService = inject(AccountService);

  totalDecks = 0;
  cardsDueToday = 0;
  totalCardsFlipped = 1420; // Just some example TODO: Make it real with real DB data
  username = '';

  ngOnInit() {
    const user = this.accountService.currentUser();
    if (user) {
      this.username = user.displayName;
    }

    this.deckService.decks$.subscribe(decks => {
      this.totalDecks = decks.length;
      this.cardsDueToday = decks.reduce((sum, deck) => sum + deck.due, 0);
    });
  }
}
