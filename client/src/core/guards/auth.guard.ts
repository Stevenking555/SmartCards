import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account-service';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toast = inject(ToastService);
  const router = inject(Router);

  if (accountService.currentUser()) return true;

  // Csak akkor küldünk toastot, ha épp belépni próbálunk (loginról vagy kívülről jövünk)
  // Ha már egy belső oldalon vagyunk és kijelentkezünk, akkor nem kell a "You shall not pass" üzenet.
  const isEnteringFromPublic = ['/login', '/register', '/'].includes(router.url);
  
  if (isEnteringFromPublic) {
    toast.error('You shall not pass! (Kérlek jelentkezz be)');
  }
  
  router.navigateByUrl('/login');
  return false;
};


