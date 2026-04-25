/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeckService } from './deck-service';
import { Deck, DeckForUser } from '../models/deck-models';
import { environment } from '../../environments/environment';

describe('DeckService', () => {
  let service: DeckService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeckService]
    });

    service = TestBed.inject(DeckService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensure no pending HTTP requests remain after a test
    httpTestingController.verify();
  });

  describe('HTTP Mocking Tests', () => {
    it('should fetch decks via GET request', () => {
      const mockDecks: DeckForUser[] = [
        { info: { id: '1', title: 'Test Deck 1', createdAt: '2026' }, stats: { knowledgePercentage: 0, timeSpentMinutes: 0, goal: 'Learn' } },
        { info: { id: '2', title: 'Test Deck 2', createdAt: '2026' }, stats: { knowledgePercentage: 0, timeSpentMinutes: 0, goal: 'Learn' } }
      ];

      service.loadDecks(false).subscribe((decks: DeckForUser[]) => {
        expect(decks).toBeTruthy();
        expect(decks.length).toBe(2);
        expect(decks[0].info.title).toBe('Test Deck 1');
      });

      const reqLastPlayed = httpTestingController.expectOne(`${environment.apiUrl}decks/last-played?limit=5`);
      expect(reqLastPlayed.request.method).toBe('GET');
      reqLastPlayed.flush([]);

      const req = httpTestingController.expectOne(`${environment.apiUrl}decks/with-stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDecks);
    });

    it('should post a new deck via POST request', () => {
      const mockCreatedDeck: Deck = { id: '3', title: 'New Deck', createdAt: '2026' };

      service.addDeck('New Deck', 'Test Goal').subscribe((deck: Deck) => {
        expect(deck).toEqual(mockCreatedDeck);
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}decks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        title: 'New Deck',
        goal: 'Test Goal'
      });

      req.flush(mockCreatedDeck);
    });
  });
});
