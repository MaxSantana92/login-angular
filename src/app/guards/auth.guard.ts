import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard = (config: { isPrivate: boolean }): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Comprobamos el estado síncrono primero (si el usuario ya está en la señal)
    if (authService.isAuthenticated()) {
      return config.isPrivate ? true : router.createUrlTree(['/dashboard']);
    }

    // 2. Si no, comprobamos si hay un token para verificarlo asíncronamente (caso de recarga de página)
    if (authService.getAccessToken()) {
      return authService.checkAuthStatus().pipe(
        map((isAuthenticated) => {
          if (isAuthenticated) {
            // Si el token es válido, el usuario ha sido cargado en la señal.
            return config.isPrivate ? true : router.createUrlTree(['/dashboard']);
          }
          // Si el token no era válido, el servicio ya ha limpiado la sesión.
          return config.isPrivate ? router.createUrlTree(['/login']) : true;
        })
      );
    }

    // 3. Si no hay ni usuario en la señal ni token, aplicamos la lógica por defecto.
    return config.isPrivate ? router.createUrlTree(['/login']) : true;
  };
};
