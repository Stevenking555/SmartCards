import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { User } from '../models/user';
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
            //If the user is not logged in, redirect to the login page
            if (req.url.includes('/login') || req.url.includes('/refresh-token')) {
              toast.error('A munkamenet lejárt, kérjük jelentkezzen be újra!');
              accountService.logout().subscribe({
                next: () => router.navigateByUrl('/login'),
                error: () => router.navigateByUrl('/login')
              });
              return throwError(() => error); // we interrupt the operation
            }

            // If the user is logged in, try to refresh the token
            return accountService.refreshToken().pipe(
              switchMap(user => {
                // SUCCESS! We got a new token. We copy the old, failed request, but with the NEW token!
                if (user && user.token) {
                  const clonedReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${user.token}`
                    }
                  });
                  // We resend the modified request. The user notices nothing!
                  return next(clonedReq);
                } else {
                  return throwError(() => error);
                }
              }),
              catchError(refreshError => {
                // FAILURE: If the refresh also failed (the 15-day cookie expired), we throw it to the Login
                toast.error('A munkamenet lejárt, kérjük jelentkezzen be újra!');
                accountService.logout().subscribe({
                  next: () => router.navigateByUrl('/login'),
                  error: () => router.navigateByUrl('/login')
                });
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
