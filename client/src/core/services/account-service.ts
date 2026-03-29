import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChangePasswordForm, LoginCreds, RegisterCreds, UpdateEmailForm, User } from '../models/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {

  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  baseUrl = environment.apiUrl;

  register(creds: RegisterCreds) {
    return this.http.post<User>(this.baseUrl + 'account/register', creds, { withCredentials: true }).pipe(
      tap(user => {
        if (user) {
          this.setCurrentUser(user);
          this.startTokenRefreshInterval();
        }
      })
    )
  }

  login(creds: LoginCreds) {
    return this.http.post<User>(this.baseUrl + 'account/login', creds, { withCredentials: true }).pipe(
      tap(user => {
        if (user) {
          this.setCurrentUser(user);
          this.startTokenRefreshInterval();
        }
      })
    )
  }

  setCurrentUser(user: User) {
    this.currentUser.set(user);
  }

  updateUserSignal(user: Partial<User>) {
    this.currentUser.update(prev => prev ? { ...prev, ...user } : null);
  }

  logout() {
    return this.http.post(this.baseUrl + 'account/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUser.set(null);
      })
    );
  }

  refreshToken() {
    return this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, { withCredentials: true });
  }

  startTokenRefreshInterval() {
    setInterval(() => {
      this.refreshToken().subscribe({
        next: user => this.setCurrentUser(user),
        error: () => this.logout().subscribe()
      });
    }, 14 * 24 * 60 * 60 * 1000) // 14 days
  }

  changePassword(model: ChangePasswordForm) {
    return this.http.post(this.baseUrl + 'account/change-password', model, { withCredentials: true });
  }

  updateEmail(model: UpdateEmailForm) {
    return this.http.put<User>(this.baseUrl + 'account/update-email', model, { withCredentials: true }).pipe(
      tap(user => {
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

}