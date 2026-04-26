/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeKey = 'smartcards-theme';
  

  // TODO: Basic DaisyUI themes - we should modify some colours down the road
  availableThemes = [
    'dark',
    'light',
    'dracula',
    'night',
    'halloween',
    'business',
    'luxury',
    'sunset',
    'retro',
    'dim',
    'synthwave',
    'coffee'
  ];

  constructor() {
    this.initTheme();
  }

  initTheme() {
    // Load saved theme or default to 'dark'
    const savedTheme = localStorage.getItem(this.currentThemeKey) || 'dark';
    this.setTheme(savedTheme, false);

    // Keeping the setted theme all of our tabs + windows
    window.addEventListener('storage', (event) => {
      if (event.key === this.currentThemeKey) {
        const newTheme = event.newValue || 'dark';
        this.setTheme(newTheme, false);
      }
    });
  }

  setTheme(theme: string, saveToStorage: boolean = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (saveToStorage) {
      localStorage.setItem(this.currentThemeKey, theme);
    }
  }

  getCurrentTheme(): string {
    return localStorage.getItem(this.currentThemeKey) || 'dark';
  }
}



