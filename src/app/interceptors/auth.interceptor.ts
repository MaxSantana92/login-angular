import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpContextToken,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, BehaviorSubject, switchMap, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

// Token de contexto para marcar peticiones reintentadas
const IS_REFRESH_RETRY = new HttpContextToken<boolean>(() => false);

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
// Subject to hold the new token
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/login') || req.url.includes('/refresh')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const token = authService.getAccessToken();

  let authReq = req;

  if (token) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        console.log('401 error intercepted for URL:', req.url);
        // Si la petición ya tiene la marca de reintento, significa que falló de nuevo tras el refresh.
        // Lanzamos el error para evitar bucle infinito.
        if (authReq.context.get(IS_REFRESH_RETRY)) {
          console.log('401 error persisted after refresh retry. Logging out.');
          authService.logout();
          return throwError(() => error);
        }
        return handle401Error(authReq, next, authService, notificationService);
      }
      return throwError(() => error);
    })
  );
};

const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const handle401Error = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  notificationService: NotificationService
) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    console.log('Starting token refresh process...');
    return authService.refreshToken().pipe(
      switchMap((tokens) => {
        console.log('Token refresh successful. New access token:', tokens.accessToken);
        isRefreshing = false;
        authService.saveTokens(tokens);
        refreshTokenSubject.next(tokens.accessToken);

        // IMPORTANTE: Marcamos la petición clonada con IS_REFRESH_RETRY = true
        // para que si falla de nuevo, no volvamos a entrar aquí.
        const retryReq = addTokenHeader(request, tokens.accessToken).clone({
          context: request.context.set(IS_REFRESH_RETRY, true),
        });

        return next(retryReq);
      }),
      catchError((err) => {
        console.error('Token refresh failed:', err);
        isRefreshing = false;
        notificationService.showError('Your session has expired. Please log in again.');
        authService.logout();
        return throwError(() => err);
      })
    );
  }

  console.log('Refresh already in progress, waiting for new token...');
  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => {
      const retryReq = addTokenHeader(request, token).clone({
        context: request.context.set(IS_REFRESH_RETRY, true),
      });
      return next(retryReq);
    })
  );
};
