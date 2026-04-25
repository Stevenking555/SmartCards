/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeckDetailComponent } from './deck-detail';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DeckService } from '../../../core/services/deck-service';
import { HomeService } from '../../../core/services/home-service';
import { LanguageService } from '../../../core/i18n/language-service';

describe('DeckDetailComponent', () => {
  let component: DeckDetailComponent;
  let fixture: ComponentFixture<DeckDetailComponent>;
  let deckServiceSpy: any;
  let homeServiceSpy: any;

  beforeEach(async () => {
    const dSpy = { 
      getOrLoadDeckForGame: vi.fn(), 
      addToLastEdited: vi.fn(), 
      updateDeckCardsLocally: vi.fn(), 
      syncCards: vi.fn(() => of({})) 
    };
    const hSpy = { updateCardCount: vi.fn() };
    const lSpy = { currentLang: () => 'en', translate: (key: string) => key }; // Simple mock

    dSpy.getOrLoadDeckForGame.mockReturnValue(of({
      info: { id: 'd1', title: 'Test Deck', isFavorite: false },
      stats: { masteredCards: 0, timeSpentStudyingMinutes: 0, lastPlayedAt: null, totalCards: 1, cardsFlippedToday: 0, cardsFlippedTotal: 0 },
      cards: [
        {
          data: { id: 'c1', question: 'Q1', answer: 'A1' },
          stats: { batchIndex: 0, rotationIndex: 0, rotationPoints: 0, isMastered: false }
        }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [DeckDetailComponent], // its standalone so we import it
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'd1' } } } },
        { provide: DeckService, useValue: dSpy },
        { provide: HomeService, useValue: hSpy },
        { provide: LanguageService, useValue: lSpy }
      ]
    }).compileComponents();
    
    deckServiceSpy = TestBed.inject(DeckService);
    homeServiceSpy = TestBed.inject(HomeService);
    
    fixture = TestBed.createComponent(DeckDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load deck data on init', () => {
    expect(component).toBeTruthy();
    expect(deckServiceSpy.getOrLoadDeckForGame).toHaveBeenCalledWith('d1');
    expect(component.deck()?.title).toBe('Test Deck');
    expect(component.cards().length).toBe(1);
  });

  it('should temporarily add a card when onCreateCard is called', () => {
    component.newCard = { question: 'New Q', answer: 'New A' };
    component.onCreateCard();

    expect(component.cards().length).toBe(2);
    expect(component.cards()[0].question).toBe('New Q');
    expect(homeServiceSpy.updateCardCount).toHaveBeenCalledWith(1);
    expect(deckServiceSpy.updateDeckCardsLocally).toHaveBeenCalled();
  });

  it('should open modal when openModal is called and signal updates properly', () => {
    expect(component.isModalOpen()).toBe(false);
    component.openModal();
    expect(component.isModalOpen()).toBe(true);
  });
});
