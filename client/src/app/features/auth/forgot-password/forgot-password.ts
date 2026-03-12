import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent {
  auth = inject(AuthService);
  router = inject(Router);
  
  email = '';

  onSubmit() {
    if (this.email) {
      this.auth.forgotPassword(this.email);
      alert("If an account with that email exists, a reset link has been sent.");
      // Sikeres jelszó-visszaállítás után navigálhatunk pl. a bejelentkező oldalra
    } else {
      alert("Wrong credentials!");
    }
  }
}