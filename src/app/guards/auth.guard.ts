import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard = (config: { isPrivate: boolean }): CanActivateFn => {
  return () => {
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Si el usuario ya está autenticado en memoria (estado síncrono)
    if (authService.isAuthenticated()) {
      return config.isPrivate ? true : router.createUrlTree(['/dashboard']);
    }

    // 2. Si hay un token, verificamos su validez con el backend
    const token = authService.getAccessToken();
    if (token) {
      return authService.checkAuthStatus().pipe(
        map((isValid) => {
          if (isValid) {
            // Token válido -> Si es ruta privada, pasa. Si es pública (login), va a dashboard.
            return config.isPrivate ? true : router.createUrlTree(['/dashboard']);
          }
          // Token inválido -> Si es ruta privada, va a login. Si es pública, se queda.
          return config.isPrivate ? router.createUrlTree(['/login']) : true;
        })
      );
    }

    // 3. Si no hay token ni usuario -> Si es ruta privada, va a login. Si es pública, pasa.
    return config.isPrivate ? router.createUrlTree(['/login']) : true;
  };
};
