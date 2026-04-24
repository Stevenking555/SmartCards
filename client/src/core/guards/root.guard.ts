/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account-service';

export const rootGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (accountService.currentUser()) {
    router.navigateByUrl('/home');
  } else {
    router.navigateByUrl('/login');
  }

  return false; // MegĂˇllĂ­tjuk az aktuĂˇlis navigĂˇciĂłt, mert ĂˇtirĂˇnyĂ­tottunk
};

