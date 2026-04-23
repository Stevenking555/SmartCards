import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { DeckForUser } from '../models/deck-models';
import { UserStats } from '../models/user-models';
import { environment } from '../../environments/environment';

export interface DailyData {
  quoteIndex: number;
  colorTheme: string;
  quoteStyle: 'motivational' | 'funny';
}



@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  clearCache() {
    this._stats.set(null);
    this.initialLoadCompleted = false;
  }

  // Internal Writable Signals
  private _dailyData = signal<DailyData>({ quoteIndex: 1, colorTheme: 'primary', quoteStyle: 'motivational' });
  private _stats = signal<UserStats | null>(null);

  // Public Read-only Signals
  public dailyData = this._dailyData.asReadonly();
  public stats = this._stats.asReadonly();

  private initialLoadCompleted = false;

  private readonly COLORS = ['primary', 'secondary', 'accent', 'info', 'success', 'warning'];
  private readonly TOTAL_MOTIVATIONAL_QUOTES = 28;
  private readonly TOTAL_FUNNY_QUOTES = 12;

  constructor() {
    this.initDailyData();
  }

  loadStats(force: boolean = false): Observable<UserStats> {
    if (!force && this.initialLoadCompleted && this._stats()) {
      return of(this._stats()!);
    }
    return this.http.get<UserStats>(`${this.baseUrl}stats/home`, { withCredentials: true }).pipe(
      tap(data => {
        this._stats.set(data);
        this.initialLoadCompleted = true;
      })
    );
  }

  updateStats(stats: UserStats) {
    this._stats.set(stats);
    this.initialLoadCompleted = true;
  }

  updateDeckCount(delta: number) {
    this._stats.update(s => s ? { ...s, totalDecks: s.totalDecks + delta } : s);
  }

  updateCardCount(delta: number) {
    this._stats.update(s => {
      if (!s) return s;
      const newVal = s.totalCards + delta;
      console.log(`Updating card count: ${s.totalCards} -> ${newVal}`);
      return { ...s, totalCards: newVal };
    });
  }

  incrementFlippedStats() {
    this._stats.update(s => s ? {
      ...s,
      flippedCardsToday: s.flippedCardsToday + 1,
      flippedCardsTotal: s.flippedCardsTotal + 1
    } : s);
  }

  private initDailyData() {
    const today = new Date().toLocaleDateString('en-CA');
    const storedDate = localStorage.getItem('lastLoginDate');
    const storedQuoteIndex = localStorage.getItem('dailyQuoteIndex');
    const storedColorTheme = localStorage.getItem('dailyColorTheme');
    const storedQuoteStyle = (localStorage.getItem('dailyQuoteStyle') as 'motivational' | 'funny') || 'motivational';

    if (storedDate === today && storedQuoteIndex && storedColorTheme) {
      this._dailyData.set({
        quoteIndex: parseInt(storedQuoteIndex, 10),
        colorTheme: storedColorTheme,
        quoteStyle: storedQuoteStyle
      });
    } else {
      const maxQuotes = storedQuoteStyle === 'funny' ? this.TOTAL_FUNNY_QUOTES : this.TOTAL_MOTIVATIONAL_QUOTES;
      const newQuoteIndex = Math.floor(Math.random() * maxQuotes) + 1;
      const newColorTheme = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

      localStorage.setItem('lastLoginDate', today);
      localStorage.setItem('dailyQuoteIndex', newQuoteIndex.toString());
      localStorage.setItem('dailyColorTheme', newColorTheme);
      localStorage.setItem('dailyQuoteStyle', storedQuoteStyle);

      this._dailyData.set({
        quoteIndex: newQuoteIndex,
        colorTheme: newColorTheme,
        quoteStyle: storedQuoteStyle
      });
    }
  }

  setQuoteStyle(style: 'motivational' | 'funny') {
    const current = this._dailyData();
    if (current.quoteStyle === style) return;

    const maxQuotes = style === 'funny' ? this.TOTAL_FUNNY_QUOTES : this.TOTAL_MOTIVATIONAL_QUOTES;
    const newQuoteIndex = Math.floor(Math.random() * maxQuotes) + 1;

    localStorage.setItem('dailyQuoteStyle', style);
    localStorage.setItem('dailyQuoteIndex', newQuoteIndex.toString());

    this._dailyData.set({
      ...current,
      quoteStyle: style,
      quoteIndex: newQuoteIndex
    });
  }
}
