import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../_services/theme.service';
import { LanguageService, Language } from '../_i18n/language.service';
import { TranslatePipe } from '../_i18n/translate.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './profile.html',
})
export class ProfilePageComponent  {
  themeService = inject(ThemeService);
  langService = inject(LanguageService);

  // Form Models
  username = '';
  email = '';
  password = '';

  themes: string[] = [];
  selectedTheme = '';

//TODO: auth --> accountService

  // ngOnInit() {
  //   this.username = this.auth.userName() || '';
  //   this.email = this.username ? this.username.toLowerCase().replace(' ', '.') + '@example.com' : '';
    
  //   this.themes = this.themeService.availableThemes;
  //   this.selectedTheme = this.themeService.getCurrentTheme();
  // }

  // saveProfile() {
  //   if (this.username.trim() && this.email.trim()) {
  //     this.auth.userName.set(this.username);
  //     alert('Profil adatok sikeresen frissĂ­tve!');
  //     this.password = '';
  //   }
  // }

  onThemeChange(theme: string) {
    this.selectedTheme = theme;
    this.themeService.setTheme(theme);
  }

  get currentLang() {
    return this.langService.currentLang();
  }

  onLanguageChange(lang: Language) {
    this.langService.setLanguage(lang);
  }
}

