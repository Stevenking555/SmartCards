import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DailyData {
  quoteIndex: number;
  colorTheme: string;
}

export interface LastPlayedDeck {
  deckId: string;
  title: string;
  lastPlayedAt: string;
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

  private dailyDataSubject = new BehaviorSubject<DailyData>({ quoteIndex: 1, colorTheme: 'primary' });
  public dailyData$ = this.dailyDataSubject.asObservable();

  private statsSubject = new BehaviorSubject<UserStats | null>(null);
  public stats$ = this.statsSubject.asObservable();
  
  private initialLoadCompleted = false;

  private readonly COLORS = ['primary', 'secondary', 'accent', 'info', 'success', 'warning'];
  private readonly TOTAL_QUOTES = 28;

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
    const today = new Date().toISOString().split('T')[0];
    const storedDate = localStorage.getItem('lastLoginDate');
    const storedQuoteIndex = localStorage.getItem('dailyQuoteIndex');
    const storedColorTheme = localStorage.getItem('dailyColorTheme');
    
    if (storedDate === today && storedQuoteIndex && storedColorTheme) {
      this.dailyDataSubject.next({ 
        quoteIndex: parseInt(storedQuoteIndex, 10),
        colorTheme: storedColorTheme
      });
    } else {
      const newQuoteIndex = Math.floor(Math.random() * this.TOTAL_QUOTES) + 1;
      const newColorTheme = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
      
      localStorage.setItem('lastLoginDate', today);
      localStorage.setItem('dailyQuoteIndex', newQuoteIndex.toString());
      localStorage.setItem('dailyColorTheme', newColorTheme);
      
      this.dailyDataSubject.next({ 
        quoteIndex: newQuoteIndex,
        colorTheme: newColorTheme
      });
    }
  }
}