import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService, Language } from '../../core/i18n/language.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { AccountService } from '../../core/services/account-service';
import { UserService } from '../../core/services/user.service';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { BottomNavComponent } from '../../layout/bottom-nav/bottom-nav';
import { ToastService } from '../../core/services/toast-service';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, SidebarComponent, BottomNavComponent],
  templateUrl: './profile.html',
})
export class ProfilePageComponent implements OnInit {
  themeService = inject(ThemeService);
  langService = inject(LanguageService);
  accountService = inject(AccountService);
  userService = inject(UserService);
  router = inject(Router);
  toast = inject(ToastService);
  fb = inject(FormBuilder);

  themes: string[] = [];
  selectedTheme = '';

  activeEditField: 'displayName' | 'email' | 'password' | null = null;
  profileForm: FormGroup = new FormGroup({});

  ngOnInit() {
    this.initializeForm();
    this.cancelEdit();
    
    this.themes = this.themeService.availableThemes;
    this.selectedTheme = this.themeService.getCurrentTheme();
  }

  initializeForm() {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      password: [{ value: '', disabled: true }],
      newPassword: [{ value: '', disabled: true }, [Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}')]] // Legalább 6 karakter, 1 kis/nagybetű és szám
    });
  }

  get usernameControl() { return this.profileForm.get('username') as FormControl; }
  get emailControl() { return this.profileForm.get('email') as FormControl; }
  get passwordControl() { return this.profileForm.get('password') as FormControl; }
  get newPasswordControl() { return this.profileForm.get('newPassword') as FormControl; }

  startEdit(field: 'displayName' | 'email' | 'password') {
    this.cancelEdit(); // Reset any past unsaved changes
    this.activeEditField = field;

    if (field === 'displayName') this.usernameControl.enable();
    if (field === 'email') this.emailControl.enable();
    if (field === 'password') this.newPasswordControl.enable();
    
    this.passwordControl.enable(); // A szerkesztéshez mindig kell az aktuális jelszó
  }

  cancelEdit() {
    this.activeEditField = null;
    const user = this.accountService.currentUser();
    
    this.profileForm.patchValue({
      username: user ? user.displayName : '',
      email: user ? user.email : '',
      password: '',
      newPassword: ''
    });
    
    this.profileForm.disable(); // Minden mezőt inaktiválunk
    this.profileForm.markAsUntouched();
  }

  saveProfile() {
    if (this.activeEditField === 'displayName' && this.usernameControl.invalid) return this.usernameControl.markAsTouched();
    if (this.activeEditField === 'email' && this.emailControl.invalid) return this.emailControl.markAsTouched();
    if (this.activeEditField === 'password' && this.newPasswordControl.invalid) return this.newPasswordControl.markAsTouched();

    if (!this.passwordControl.value?.trim()) {
      this.passwordControl.setErrors({ required: true });
      this.passwordControl.markAsTouched();
      return;
    }

    const val = this.profileForm.value;
    const user = this.accountService.currentUser();
    if (!user) return;

    let requestObs: Observable<any>;

    switch (this.activeEditField) {
      case 'displayName':
        if (val.username === user.displayName) return this.cancelEdit();
        requestObs = this.userService.updateUser({ displayName: val.username, currentPassword: val.password }).pipe(
          tap(() => this.accountService.updateUserSignal({ displayName: val.username }))
        );
        break;

      case 'email':
        if (val.email === user.email) return this.cancelEdit();
        requestObs = this.accountService.updateEmail({ newEmail: val.email, currentPassword: val.password });
        break;

      case 'password':
        if (!val.newPassword?.trim()) return this.cancelEdit();
        requestObs = this.accountService.changePassword({ oldPassword: val.password, newPassword: val.newPassword });
        break;

      default:
        this.cancelEdit();
        return;
    }

    requestObs.subscribe({
      next: () => {
        this.toast.success(this.langService.translate('profile.alert.success'));
        this.cancelEdit();
      },
      error: (err: any) => {
        if (err.error?.errors) {
          const errors = err.error.errors;
          if (errors.CurrentPassword) this.passwordControl.setErrors({ serverError: errors.CurrentPassword[0] });
          if (errors.Email) this.emailControl.setErrors({ serverError: errors.Email[0] });
          if (errors.DisplayName) this.usernameControl.setErrors({ serverError: errors.DisplayName[0] });
          if (errors.Identity) {
             if (this.activeEditField === 'password') this.newPasswordControl.setErrors({ serverError: errors.Identity[0] });
             else this.passwordControl.setErrors({ serverError: errors.Identity[0] });
          }
        } else {
          const errorMessage = typeof err.error === 'string' ? err.error : err.message || this.langService.translate('error.unexpected');
          this.toast.error(errorMessage);
        }
      }
    });
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

  logout() {
    this.accountService.logout().subscribe({
      next: () => this.router.navigateByUrl('/')
    });
  }
}

