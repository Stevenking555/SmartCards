/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account-service';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toast = inject(ToastService);
  const router = inject(Router);

  if (accountService.currentUser()) return true;

  toast.error('Please log in or register to continue!');
  router.navigateByUrl('/login');
  return false;
};

