/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameService } from './game-service';
import { DeckService } from './deck-service';
import { HomeService } from './home-service';
import { of } from 'rxjs';
import { DeckForUser } from '../models/deck-models';

describe('GameService', () => {
  let service: GameService;
  let deckServiceSpy: any;
  let homeServiceSpy: any;

  const mockDeckData: DeckForUser = {
    info: { id: 'd1', title: 'Test Deck', createdAt: '2026' },
    stats: { 
      knowledgePercentage: 0, timeSpentMinutes: 0, goal: 'Learn'
    },
    cards: [
      {
        data: { id: 'c1', question: 'Q1', answer: 'A1' },
        stats: { batchIndex: 0, rotationPoints: 0, rotationIndex: 0, isMastered: false }
      },
      {
        data: { id: 'c2', question: 'Q2', answer: 'A2' },
        stats: { batchIndex: 0, rotationPoints: 0, rotationIndex: 0, isMastered: false }
      }
    ]
  };

  beforeEach(() => {
    const dSpy = { getOrLoadDeckForGame: vi.fn(), addToLastPlayed: vi.fn() };
    const hSpy = { incrementFlippedStats: vi.fn(), updateStats: vi.fn() };

    // Setup default responses
    dSpy.getOrLoadDeckForGame.mockReturnValue(of(JSON.parse(JSON.stringify(mockDeckData))));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: DeckService, useValue: dSpy },
        { provide: HomeService, useValue: hSpy }
      ]
    });

    service = TestBed.inject(GameService);
    deckServiceSpy = TestBed.inject(DeckService);
    homeServiceSpy = TestBed.inject(HomeService);
  });

  afterEach(() => {
    service.endSession();
  });

  describe('Session Lifecycle & Batch Initialization', () => {
    it('should initialize batches and load first card when starting a session', () => {
      service.startSession('d1');

      const currentCard = service.currentStudyCard();
      expect(currentCard).toBeTruthy();
      expect(currentCard?.data.question).toBe('Q1');
      
      // Since they both started at batchIndex 0, they should both be moved to batch 1
      const allCards = service.allCardsWithStats();
      expect(allCards[0].stats.batchIndex).toBe(1);
      expect(allCards[1].stats.batchIndex).toBe(1);
    });

    it('should clear data when ending session', () => {
      service.startSession('d1');
      expect(service.gameData()).toBeTruthy();

      service.endSession();
      expect(service.gameData()).toBeUndefined();
    });
  });

  describe('Card Rating Logic', () => {
    it('should calculate new rotation points when rating a card "hard"', () => {
      service.startSession('d1');
      
      // Rate the first card (Q1) as hard
      service.rateCard('hard');
      
      // Verify stats updated in Signal
      const cards = service.allCardsWithStats();
      const ratedCard = cards.find(c => c.data.id === 'c1');
      
      expect(ratedCard?.stats.rotationPoints).toBe(2); // "hard" adds 2 points
    });

    it('should mark card as mastered and reset its batch/points when rating "mastered"', () => {
      service.startSession('d1');
      const startCard = service.currentStudyCard();
      const cardId = startCard?.data.id;

      service.rateCard('mastered');

      const cards = service.allCardsWithStats();
      const ratedCard = cards.find(c => c.data.id === cardId);

      expect(ratedCard?.stats.isMastered).toBe(true);
      expect(ratedCard?.stats.batchIndex).toBe(0);
      expect(ratedCard?.stats.rotationPoints).toBe(0);
    });
  });
});
