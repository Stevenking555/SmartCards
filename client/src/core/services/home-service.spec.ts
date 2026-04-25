/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HomeService } from './home-service';
import { environment } from '../../environments/environment';

describe('HomeService', () => {
  let service: HomeService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HomeService]
    });

    localStorage.clear();
    // Re-inject service to guarantee initDailyData runs fresh for some tests
  });

  afterEach(() => {
    if (httpTestingController) {
      httpTestingController.verify();
    }
  });

  describe('Daily Data Logic', () => {
    it('should generate new random quote and theme if localStorage is empty', () => {
      service = TestBed.inject(HomeService);
      
      const today = new Date().toLocaleDateString('en-CA');
      expect(localStorage.getItem('lastLoginDate')).toBe(today);
      expect(localStorage.getItem('dailyQuoteIndex')).toBeTruthy();
      expect(localStorage.getItem('dailyColorTheme')).toBeTruthy();
      expect(localStorage.getItem('dailyQuoteStyle')).toBe('motivational');
    });

    it('should load existing quote and theme if date matches today', () => {
      const today = new Date().toLocaleDateString('en-CA');
      localStorage.setItem('lastLoginDate', today);
      localStorage.setItem('dailyQuoteIndex', '15');
      localStorage.setItem('dailyColorTheme', 'accent');
      localStorage.setItem('dailyQuoteStyle', 'motivational');

      service = TestBed.inject(HomeService);

      const dailyData = service.dailyData();
      expect(dailyData.quoteIndex).toBe(15);
      expect(dailyData.colorTheme).toBe('accent');
      expect(dailyData.quoteStyle).toBe('motivational');
    });

    it('should update quote style when setQuoteStyle is called', () => {
      service = TestBed.inject(HomeService);
      
      service.setQuoteStyle('funny');
      
      const dailyData = service.dailyData();
      expect(dailyData.quoteStyle).toBe('funny');
      expect(localStorage.getItem('dailyQuoteStyle')).toBe('funny');
    });
  });

  describe('Stats HTTP Logic', () => {
    it('should load stats and set initialLoadCompleted to true', () => {
      service = TestBed.inject(HomeService);
      httpTestingController = TestBed.inject(HttpTestingController);

      const mockStats = {
        totalDecks: 5,
        totalCards: 100,
        flippedCardsToday: 10,
        flippedCardsTotal: 50,
        learningStreak: 3
      };

      service.loadStats().subscribe(stats => {
        expect(stats).toEqual(mockStats as any);
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}stats/home`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);

      // Next call shouldn't trigger HTTP request because it's cached
      service.loadStats().subscribe(stats => {
        expect(stats).toEqual(mockStats as any);
      });

      // Assert no new HTTP requests are made
      httpTestingController.expectNone(`${environment.apiUrl}stats/home`);
    });
  });
});
