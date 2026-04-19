import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DeckService } from '../../core/services/deck-service';
import { HomeService, DailyData } from '../../core/services/home-service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { BottomNavComponent } from '../../layout/bottom-nav/bottom-nav';
import { AccountService } from '../../core/services/account-service';
import { LanguageButtonComponent } from '../../shared/components/language-button/language-button';
import { ThemeButtonComponent } from '../../shared/components/theme-button/theme-button';
import { DeckCardComponent } from '../../shared/components/deck-card/deck-card';
import { DeckForUser } from '../../core/models/deck-models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, SidebarComponent, BottomNavComponent, LanguageButtonComponent, ThemeButtonComponent, DeckCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  deckService = inject(DeckService);
  accountService = inject(AccountService);
  homeService = inject(HomeService);

  username = computed(() => this.accountService.currentUser()?.displayName || 'Guest');
  dailyData = this.homeService.dailyData;
  userStats = this.homeService.stats;
  lastPlayedDecks = this.deckService.lastPlayedDecks;

  weeklyActivity = computed(() => {
    const weeklyData: number[] = JSON.parse(this.userStats()?.weeklyActivityJson || '[0,0,0,0,0,0,0]');
    const maxVal = Math.max(...weeklyData, 1);
    const currentDayIndex = new Date().getDay();

    const daysOrder = [1, 2, 3, 4, 5, 6, 0];
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    return daysOrder.map((dayIdx, i) => ({
      dayKey: dayKeys[i],
      value: weeklyData[dayIdx],
      heightPercent: (weeklyData[dayIdx] / maxVal * 100) + '%',
      isToday: currentDayIndex === dayIdx
    }));
  });

  get themeClasses() {
    switch (this.dailyData().colorTheme) {
      case 'secondary': return { container: 'bg-secondary/10 border-secondary/20', circle: 'bg-secondary/20', text: 'text-secondary/80', chart: 'bg-secondary', chartBg: 'bg-secondary/20', chartHover: 'hover:bg-secondary/80' };
      case 'accent': return { container: 'bg-accent/10 border-accent/20', circle: 'bg-accent/20', text: 'text-accent/80', chart: 'bg-accent', chartBg: 'bg-accent/20', chartHover: 'hover:bg-accent/80' };
      case 'info': return { container: 'bg-info/10 border-info/20', circle: 'bg-info/20', text: 'text-info/80', chart: 'bg-info', chartBg: 'bg-info/20', chartHover: 'hover:bg-info/80' };
      case 'success': return { container: 'bg-success/10 border-success/20', circle: 'bg-success/20', text: 'text-success/80', chart: 'bg-success', chartBg: 'bg-success/20', chartHover: 'hover:bg-success/80' };
      case 'warning': return { container: 'bg-warning/10 border-warning/20', circle: 'bg-warning/20', text: 'text-warning/80', chart: 'bg-warning', chartBg: 'bg-warning/20', chartHover: 'hover:bg-warning/80' };
      default: return { container: 'bg-primary/10 border-primary/20', circle: 'bg-primary/20', text: 'text-primary/80', chart: 'bg-primary', chartBg: 'bg-primary/20', chartHover: 'hover:bg-primary/80' };
    }
  }

  ngOnInit() {
    this.homeService.loadStats().subscribe();
    this.deckService.loadDecks().subscribe(); // Background load all decks
  }
}

