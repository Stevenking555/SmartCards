/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language-service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(LanguageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and default to English', () => {
    expect(service).toBeTruthy();
    expect(service.currentLang()).toBe('en');
    expect(localStorage.getItem('smartcards-language')).toBe('en');
  });

  it('should update currentLang signal and localStorage when setting language', () => {
    service.setLanguage('hu');
    
    expect(service.currentLang()).toBe('hu');
    expect(localStorage.getItem('smartcards-language')).toBe('hu');
  });

  it('should return translation if key exists', () => {
    service.setLanguage('en');
    expect(service.translate('nav.decks')).toBe('Decks');
    
    service.setLanguage('hu');
    expect(service.translate('nav.decks')).toBe('Paklik');
  });

  it('should return the key itself if translation does not exist', () => {
    service.setLanguage('en');
    expect(service.translate('UNKNOWN_KEY')).toBe('UNKNOWN_KEY');
  });
});
