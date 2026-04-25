/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme-service';

@Component({
  selector: 'app-theme-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-button.html',
})
export class ThemeButtonComponent implements OnInit {
  private themeService = inject(ThemeService);

  isThemeDropdownOpen = signal(false);

  themes: string[] = [];
  currentIndex = signal(0);

  toggleDropdown() {
    this.isThemeDropdownOpen.update(v => !v);
  }

  ngOnInit() {
    this.themes = this.themeService.availableThemes;
    const currentTheme = this.themeService.getCurrentTheme();
    const idx = this.themes.indexOf(currentTheme);
    this.currentIndex.set(idx === -1 ? 0 : idx);
  }

  nextTheme() {
    this.currentIndex.update(v => (v + 1) % this.themes.length);
    this.themeService.setTheme(this.themes[this.currentIndex()]);
  }

  prevTheme() {
    this.currentIndex.update(v => (v - 1 + this.themes.length) % this.themes.length);
    this.themeService.setTheme(this.themes[this.currentIndex()]);
  }
}

