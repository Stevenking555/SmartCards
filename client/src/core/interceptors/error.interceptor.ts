/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { User } from '../models/user-models';
import { NavigationExtras, Router } from '@angular/router';
import { AccountService } from '../services/account-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  const accountService = inject(AccountService);

  return next(req).pipe(
    catchError(error => {
      if (error) {
        switch (error.status) {
          case 400:
            if (error.error.errors) {
              // Re-throw to allow component-level field mapping
              throw error;
            } else {
              toast.error(error.error)
            }
            break;
          case 401:
            // Authentication/Authorization failure
            const isAuthRequest = req.url.includes('/login') || req.url.includes('/refresh-token') || req.url.includes('/logout');

            if (isAuthRequest) {
              // If the refresh-token specifically failed, it means the session/cookie is gone.
              // We only show a toast if the user was actually logged in previously (indicated by current user)
              // and if we are not already in logout phase.
              if (req.url.includes('/refresh-token') && accountService.currentUser() !== null) {
                toast.error('Your session has expired, please log in again!');
              }

              // In any case, we want to clear the local user and redirect to login
              // Use direct setter if logout() would cause another 401 loop
              accountService.currentUser.set(null);
              router.navigateByUrl('/login');
              return throwError(() => error);
            }

            // For other requests, attempt to refresh the token
            return accountService.refreshToken().pipe(
              switchMap(user => {
                if (user && user.token) {
                  const clonedReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${user.token}` }
                  });
                  return next(clonedReq);
                }
                return throwError(() => error);
              }),
              catchError(refreshError => {
                toast.error('Your session has expired, please log in again!');
                accountService.currentUser.set(null);
                router.navigateByUrl('/login');
                return throwError(() => refreshError);
              })
            );
          case 404:
            router.navigateByUrl('/not-found')
            break;
          case 500:
            const navigationExtras: NavigationExtras = { state: { error: error.error } }
            router.navigateByUrl('/server-error', navigationExtras)
            break;
          default:
            toast.error('Something went wrong');
            break;
        }
      }

      throw error;
    })
  )
};

