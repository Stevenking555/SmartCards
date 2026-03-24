import { Injectable, signal } from '@angular/core';
import { EN, HU } from './translations';

export type Language = 'en' | 'hu';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'smartcards-language';
  
  currentLang = signal<Language>('en');

  constructor() {
    this.initLanguage();
    
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY && event.newValue) {
        if (event.newValue === 'en' || event.newValue === 'hu') {
          this.currentLang.set(event.newValue as Language);
        }
      }
    });
  }

  private initLanguage() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Language;
    if (saved && (saved === 'en' || saved === 'hu')) {
      this.currentLang.set(saved);
    } else {
      this.currentLang.set('en');
      localStorage.setItem(this.STORAGE_KEY, 'en');
    }
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  translate(key: string): string {
    const dict = this.currentLang() === 'hu' ? HU : EN;
    return dict[key] || key;
  }
}
