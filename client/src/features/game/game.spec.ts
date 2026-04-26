/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../core/services/game-service';
import { LanguageService } from '../../core/i18n/language-service';
import { signal } from '@angular/core';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let gameServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    const gSpy = {
      startSession: vi.fn(), rateCard: vi.fn(), handleProgressionChoice: vi.fn(), endSession: vi.fn(),
      deck: signal({ id: '1', title: 'Test Deck' }),
      currentStudyCard: signal({ data: { id: 'c1', question: 'Q', answer: 'A' }, stats: {} }),
      isSelectionMode: signal(false),
      activeBatch: signal(0),
      currentRotationPointer: signal(0),
      activeRotation: signal([])
    };

    const lSpy = { currentLang: () => 'en', translate: (key: string) => key };
    const rSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: Router, useValue: rSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'd1' } } } },
        { provide: GameService, useValue: gSpy },
        { provide: LanguageService, useValue: lSpy }
      ]
    }).compileComponents();
    
    gameServiceSpy = TestBed.inject(GameService);
    routerSpy = TestBed.inject(Router);
    
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize game session on init', () => {
    expect(component).toBeTruthy();
    expect(gameServiceSpy.startSession).toHaveBeenCalledWith('d1');
  });

  it('should toggle flip state when flipCard is called', () => {
    expect(component.isCardFlipped()).toBe(false);
    component.flipCard();
    expect(component.isCardFlipped()).toBe(true);
  });

  it('should rate card and determine if progression modal should show', () => {
    // Mock shouldShowModal = false (next card should just load)
    gameServiceSpy.rateCard.mockReturnValue(false);
    
    component.rateCard('good');
    expect(gameServiceSpy.rateCard).toHaveBeenCalledWith('good');
    expect(component.showProgressionModal()).toBe(false);
    
    // Mock shouldShowModal = true (goal reached)
    gameServiceSpy.rateCard.mockReturnValue(true);
    
    component.rateCard('hard');
    expect(component.showProgressionModal()).toBe(true);
  });

  it('should handle progression choice and close modal', () => {
    component.showProgressionModal.set(true);
    component.isCardFlipped.set(true);
    
    component.handleProgressionChoice('next');
    
    expect(component.showProgressionModal()).toBe(false);
    expect(component.isCardFlipped()).toBe(false);
    expect(gameServiceSpy.handleProgressionChoice).toHaveBeenCalledWith('next');
  });

  it('should end session and navigate away when closing the game', () => {
    component.closeGame();
    
    expect(gameServiceSpy.endSession).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/decks', 'd1']);
  });
});
