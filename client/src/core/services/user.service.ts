import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { User, UserUpdateForm } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  baseUrl = 'https://localhost:5001/api/';

  getUsers() {
    return this.http.get<User[]>(this.baseUrl + 'user');
  }

  getUser(id: string) {
    return this.http.get<User>(this.baseUrl + 'user/' + id);
  }

  updateUser(model: UserUpdateForm) {
    return this.http.put(this.baseUrl + 'user', model);
  }
}


