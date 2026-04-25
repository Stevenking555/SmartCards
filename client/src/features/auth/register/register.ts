/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../../../core/services/account-service';
import { Router } from '@angular/router';
import { TextInput } from '../../../shared/text-input/text-input';
import { ToastService } from '../../../core/services/toast-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TextInput],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements OnInit {

  @Output() cancelRegister = new EventEmitter<void>();
  private accountService = inject(AccountService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  protected registerForm: FormGroup = new FormGroup({});

  ngOnInit(): void {
    if (this.accountService.currentUser()) {
      this.router.navigateByUrl('/home');
      return;
    }
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(32)]],
      displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(32)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(32),
        // Password pattern: at least one digit, one lowercase, and one uppercase letter
        Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,32}$/)
      ]]
    });
  }

  register() {
    if (this.registerForm.valid) {
      this.accountService.register(this.registerForm.value).subscribe({
        next: _ => {
          this.router.navigateByUrl('/home');
        },
        error: err => {
          console.log('Registration error details:', err);
          if (err.error && err.error.errors) {
            const validationErrors = err.error.errors;
            for (const key in validationErrors) {
              if (validationErrors.hasOwnProperty(key)) {
                let controlName = key.charAt(0).toLowerCase() + key.slice(1);
                if (controlName === 'identity') {
                  controlName = 'password';
                }
                const control = this.registerForm.get(controlName);
                if (control) {
                  control.setErrors({ serverError: validationErrors[key].join(', ') });
                }
              }
            }
            this.registerForm.markAllAsTouched();
          } else if (typeof err === 'string' || Array.isArray(err)) {
            const msgs = Array.isArray(err) ? err : [err];
            this.toast.error(msgs.join('\n'));
          } else {
            this.toast.error('Unexpected error during registration');
          }
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  cancel() {
    this.cancelRegister.emit();
  }
}
