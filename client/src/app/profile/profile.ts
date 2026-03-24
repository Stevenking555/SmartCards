import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../_services/theme.service';
import { LanguageService, Language } from '../_i18n/language.service';
import { TranslatePipe } from '../_i18n/translate.pipe';
import { AccountService } from '../_services/account-service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './profile.html',
})
export class ProfilePageComponent implements OnInit {
  themeService = inject(ThemeService);
  langService = inject(LanguageService);
  accountService = inject(AccountService);
  userService = inject(UserService);

  // Form Models
  username = '';
  email = '';
  password = '';
  newPassword = '';

  themes: string[] = [];
  selectedTheme = '';

  ngOnInit() {
    const user = this.accountService.currentUser();
    if (user) {
      this.username = user.displayName;
      this.email = user.email;
    }
    
    this.themes = this.themeService.availableThemes;
    this.selectedTheme = this.themeService.getCurrentTheme();
  }

  saveProfile() {
    if (this.username.trim() && this.email.trim() && this.password.trim()) {
      this.accountService.updateEmail({ newEmail: this.email, currentPassword: this.password }).subscribe({
        next: () => {
          this.userService.updateUser({ displayName: this.username }).subscribe({
            next: () => {
              if (this.newPassword.trim()) {
                this.accountService.changePassword({ oldPassword: this.password, newPassword: this.newPassword }).subscribe({
                  next: () => {
                    alert(this.langService.translate('profile.alert.success'));
                    this.password = '';
                    this.newPassword = '';
                  },
                  error: err => alert(err.message || 'Error changing password')
                });
              } else {
                alert(this.langService.translate('profile.alert.success'));
                this.password = '';
              }
            },
            error: err => alert(err.message || this.langService.translate('profile.alert.error.name'))
          });
        },
        error: err => alert(err.message || this.langService.translate('profile.alert.error.email'))
      });
    } else {
      alert(this.langService.translate('profile.alert.require_password'));
    }
  }

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
