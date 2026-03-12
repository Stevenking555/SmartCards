import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal-t használunk az azonnali UI frissítéshez (React useState megfelelője)
  userName = signal<string | null>(null);

  register(email: string, password: string, passwordAgain: string) {
    const name = email.split('@')[0];
    this.userName.set(name);
  }

  login(email: string, password: string) {
    const name = email.split('@')[0];
    this.userName.set(name);
  }

  logout() {
    this.userName.set(null);
  }

  forgotPassword(email: string) {
    // Implement forgot password logic here
  }
}