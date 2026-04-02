import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DeckService } from '../../core/services/deck.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { BottomNavComponent } from '../../layout/bottom-nav/bottom-nav';
import { AccountService } from '../../core/services/account-service';
import { LanguageButtonComponent } from '../../shared/components/language-button/language-button';
import { ThemeButtonComponent } from '../../shared/components/theme-button/theme-button';
import { Deck } from '../../core/models/deck.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, SidebarComponent, BottomNavComponent, LanguageButtonComponent, ThemeButtonComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  deckService = inject(DeckService);
  accountService = inject(AccountService);

  totalDecks = 2;
  totalCards = 21;
  cardsDueToday = 1;
  masteredCards = 142; // Just some example TODO: Make it real with real DB data
  totalLearningTime = "12.5"; // Just some example TODO: Make it real with real DB data
  username = 'Guest';
  recentDecks: Deck[] = [];
  randomQuoteIndex = 1;

  ngOnInit() {
    this.randomQuoteIndex = Math.floor(Math.random() * 8) + 1;

    const user = this.accountService.currentUser();
    if (user) {
      this.username = user.displayName;
    }

    // this.deckService.loadDecks().subscribe();
    // this.deckService.decks$.subscribe(decks => {
    //   this.totalDecks = decks.length;
    //   this.totalCards = decks.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0);
    //   this.cardsDueToday = decks.reduce((sum, deck) => sum + (deck.due || 0), 0);
    //   this.recentDecks = decks.slice(0, 3);
    // });
  }
}