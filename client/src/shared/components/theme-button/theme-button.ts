import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-button.html',
})
export class ThemeButtonComponent implements OnInit {
  private themeService = inject(ThemeService);

  isThemeDropdownOpen = false;
  themes: string[] = [];
  currentIndex = 0;

  ngOnInit() {
    this.themes = this.themeService.availableThemes;
    const currentTheme = this.themeService.getCurrentTheme();
    this.currentIndex = this.themes.indexOf(currentTheme);
    if (this.currentIndex === -1) this.currentIndex = 0;
  }

  nextTheme() {
    this.currentIndex = (this.currentIndex + 1) % this.themes.length;
    this.themeService.setTheme(this.themes[this.currentIndex]);
  }

  prevTheme() {
    this.currentIndex = (this.currentIndex - 1 + this.themes.length) % this.themes.length;
    this.themeService.setTheme(this.themes[this.currentIndex]);
  }
}