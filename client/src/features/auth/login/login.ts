/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account-service';
import { RegisterComponent } from '../register/register';
import { TextInput } from '../../../shared/text-input/text-input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RegisterComponent, TextInput],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {

  protected accountService = inject(AccountService);
  protected router = inject(Router);
  private fb = inject(FormBuilder);

  protected loginForm: FormGroup = new FormGroup({});

  constructor() {
    if (this.accountService.currentUser()) {
      this.router.navigateByUrl('/home');
    }
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.accountService.login(this.loginForm.value).subscribe({
        next: _ => {
          this.router.navigateByUrl('/home');
        },
        error: err => {
          if (err.status === 401) {
            this.loginForm.get('password')?.setErrors({ serverError: 'Wrong email or password!' });
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  protected registerMode = signal(false);

  showRegister() {
    this.registerMode.set(true);
  }

  cancelRegister() {
    this.registerMode.set(false);
  }
}
