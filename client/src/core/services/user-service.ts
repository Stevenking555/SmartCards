/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { User, UserUpdateForm } from '../models/user-models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

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



