import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfilePageComponent {

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }

}
