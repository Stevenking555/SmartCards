import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DailyData {
  quoteIndex: number;
  colorTheme: string;
  loginStreak: number;
  quoteStyle: 'motivational' | 'funny';
}

export interface LastPlayedDeck {
  deckId: string;
  title: string;
  lastPlayedAt: string;
  progress: number;
  timeSpentMinutes: number;
}

export interface UserStats {
  flippedCardsTotal: number;
  flippedCardsToday: number;
  learningStreak: number;
  totalDecks: number;
  totalCards: number;
  totalMasteredCards: number;
  lastFlipAt: string;
  weeklyActivityJson: string;
  lastPlayedDecks: LastPlayedDeck[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  private dailyDataSubject = new BehaviorSubject<DailyData>({ quoteIndex: 1, colorTheme: 'primary', loginStreak: 0, quoteStyle: 'motivational' });
  public dailyData$ = this.dailyDataSubject.asObservable();

  private statsSubject = new BehaviorSubject<UserStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  private initialLoadCompleted = false;

  private readonly COLORS = ['primary', 'secondary', 'accent', 'info', 'success', 'warning'];
  private readonly TOTAL_MOTIVATIONAL_QUOTES = 28;
  private readonly TOTAL_FUNNY_QUOTES = 12;

  constructor() {
    this.initDailyData();
  }

  loadStats(): Observable<UserStats> {
    if (this.initialLoadCompleted && this.statsSubject.value) {
      return of(this.statsSubject.value);
    }
    return this.http.get<UserStats>(`${this.baseUrl}stats/home`, { withCredentials: true }).pipe(
      tap(stats => {
        this.statsSubject.next(stats);
        this.initialLoadCompleted = true;
      })
    );
  }

  private initDailyData() {
    const today = new Date().toLocaleDateString('en-CA');
    const storedDate = localStorage.getItem('lastLoginDate');
    const storedQuoteIndex = localStorage.getItem('dailyQuoteIndex');
    const storedColorTheme = localStorage.getItem('dailyColorTheme');
    const storedStreakStr = localStorage.getItem('loginStreak');
    const storedQuoteStyle = (localStorage.getItem('dailyQuoteStyle') as 'motivational' | 'funny') || 'motivational';

    let currentStreak = storedStreakStr ? parseInt(storedStreakStr, 10) : 0;

    if (storedDate) {
      if (storedDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');

        if (storedDate === yesterdayStr) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
    } else {
      currentStreak = 1;
    }

    localStorage.setItem('loginStreak', currentStreak.toString());

    if (storedDate === today && storedQuoteIndex && storedColorTheme) {
      this.dailyDataSubject.next({
        quoteIndex: parseInt(storedQuoteIndex, 10),
        colorTheme: storedColorTheme,
        loginStreak: currentStreak,
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

      this.dailyDataSubject.next({
        quoteIndex: newQuoteIndex,
        colorTheme: newColorTheme,
        loginStreak: currentStreak,
        quoteStyle: storedQuoteStyle
      });
    }
  }

  setQuoteStyle(style: 'motivational' | 'funny') {
    const current = this.dailyDataSubject.value;
    if (current.quoteStyle === style) return;

    const maxQuotes = style === 'funny' ? this.TOTAL_FUNNY_QUOTES : this.TOTAL_MOTIVATIONAL_QUOTES;
    const newQuoteIndex = Math.floor(Math.random() * maxQuotes) + 1;

    localStorage.setItem('dailyQuoteStyle', style);
    localStorage.setItem('dailyQuoteIndex', newQuoteIndex.toString());

    this.dailyDataSubject.next({
      ...current,
      quoteStyle: style,
      quoteIndex: newQuoteIndex
    });
  }
}