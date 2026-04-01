import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Language, LanguageService } from '../../../core/i18n/language.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-language-button',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './language-button.html',
})
export class LanguageButtonComponent {
  languageService = inject(LanguageService);

  isDropdownOpen = false;

  get currentLang() {
    return this.languageService.currentLang();
  }

  onLanguageChange(lang: Language) {
    this.languageService.setLanguage(lang);
    this.isDropdownOpen = false;
  }
}