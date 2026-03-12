import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  
  email = '';
  password = '';

  onSubmit() {
    if (this.email && this.password.length >= 6) {
      this.auth.login(this.email, this.password);
      // Sikeres belépés után navigálhatunk pl. a főoldalra
    } else {
      alert("Wrong credentials!");
    }
  }
}