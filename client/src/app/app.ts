import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AccountService } from '../core/services/account-service';
import { lastValueFrom } from 'rxjs';
import { User } from '../core/models/user';
import { ThemeService } from '../core/services/theme.service';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet]
})
export class App implements OnInit {

  private accountService = inject(AccountService);
  private themeService = inject(ThemeService); // Initializes the saved theme on load
  protected title ='Client';
  private http = inject(HttpClient);
  protected members = signal<User[]>([]);

  async ngOnInit() {
    this.members.set(await this.getMembers());
    this.setCurrentUser();
  }

  setCurrentUser() {

    const userString = localStorage.getItem('user');
    if (!userString) return;

    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);

  }

  async getMembers() {
    try {
      return lastValueFrom(this.http.get<User[]>('https://localhost:5001/api/members'));
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

}


