import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DeckService } from '../../core/services/deck.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { BottomNavComponent } from '../../layout/bottom-nav/bottom-nav';
import { AccountService } from '../../core/services/account-service';
import { LanguageButtonComponent } from '../../shared/components/language-button/language-button';
import { ThemeButtonComponent } from '../../shared/components/theme-button/theme-button';

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


  totalDecks = 0;
  cardsDueToday = 0;
  totalCardsFlipped = 1420; // Just some example TODO: Make it real with real DB data
  username = computed(() => this.accountService.currentUser()?.displayName || 'Guest');


  ngOnInit() {
    // this.deckService.loadDecks().subscribe();
    this.deckService.decks$.subscribe(decks => {
      this.totalDecks = decks.length;
      this.cardsDueToday = decks.reduce((sum, deck) => sum + deck.due, 0);
    });
  }
}