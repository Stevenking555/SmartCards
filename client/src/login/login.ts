import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../core/services/account-service';
import { RegisterComponent } from '../account/register/register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, RegisterComponent],
  templateUrl: './login.html'
})
export class LoginComponent {

  protected accountService = inject(AccountService);
  protected router = inject(Router);
  protected creds: any = {}


  login() {
    this.accountService.login(this.creds).subscribe({
      next: result => {
        console.log(result);
        this.creds = {};
        this.router.navigateByUrl('/home');
      },
      error: error => alert(error.message)
    })
  }

  logout() {
    this.accountService.logout().subscribe({
      next: () => this.router.navigateByUrl('/')
    });
  }

  protected registerMode = signal(false);

  showRegister() {
    this.registerMode.set(true);
  }

  cancelRegister() {
    this.registerMode.set(false);
  }
}

