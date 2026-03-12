import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html'
})
export class RegisterComponent {
  auth = inject(AuthService);
  router = inject(Router);
  
  email = '';
  password = '';
  passwordAgain = '';

  onSubmit() {
    if (this.email && this.password.length >= 6 && this.password === this.passwordAgain) {
      this.auth.register(this.email, this.password, this.passwordAgain);
      // Sikeres regisztráció után navigálhatunk pl. a bejelentkező oldalra
    } else {
      alert("Wrong credentials!");
    }
  }
}