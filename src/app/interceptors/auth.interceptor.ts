import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const token = authService.getToken();

  let headers = req.headers;

  // Añadimos Content-Type para peticiones POST
  if (req.method === 'POST') {
    headers = headers.set('Content-Type', 'application/json');
  }

  // Añadimos el token de autorización si existe
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({ headers });

  return next(authReq).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        notificationService.showError('Your session has expired. Please log in again.');
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
