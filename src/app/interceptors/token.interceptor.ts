import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { TokenApiModel } from '../model/token-api.model';

export const TokenInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const swal = Swal;
  const token = auth.getToken();

  if (token) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(request).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        const tokenApiModel = new TokenApiModel();
        tokenApiModel.accessToken = localStorage.getItem('token')!;
        tokenApiModel.refreshToken = localStorage.getItem('refreshToken')!;

        return auth.renewToken(tokenApiModel).pipe(
          switchMap((newToken: any) => {
            if (newToken && newToken.accessToken) {
              // Update the token in localStorage
              console.log('New token received:', newToken.accessToken);
              localStorage.setItem('token', newToken.accessToken);

              // Clone the original request with the new token
              const clonedRequest = request.clone({
                setHeaders: { Authorization: `Bearer ${newToken.accessToken}` }
              });

              // Retry the request with the new token
              return next(clonedRequest);
            } else {
              throw new Error('Invalid token response');
            }
          }),
          catchError((renewError) => {
            console.error('Token renewal failed:', renewError);
            swal.fire({
              icon: 'error',
              title: 'Session Expired',
              text: 'Please log in again.',
              width: '400px',
              heightAuto: false,
              confirmButtonText: 'OK',
              confirmButtonColor: '#005F83'
            }).then(() => {
              localStorage.clear();
              router.navigate(['/login']);
            });
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};