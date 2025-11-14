import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario ya está cargado y autenticado, redirige al dashboard.
  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }

  // Si no hay usuario, pero sí hay un token, intenta verificarlo.
  if (authService.getToken()) {
    return authService.checkAuthStatus().pipe(
      map(isAuthenticated => {
        // Si el token era válido (usuario cargado), redirige al dashboard.
        if (isAuthenticated) {
          return router.createUrlTree(['/dashboard']);
        }
        // Si el token era inválido, permite el acceso a la página pública (login).
        return true;
      })
    );
  }

  // Si no hay ni usuario ni token, permite el acceso a la página pública.
  return true;
};
