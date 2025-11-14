import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya tenemos un usuario en la señal, permite el acceso.
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no hay usuario, pero hay un token, intenta verificarlo.
  if (authService.getToken()) {
    return authService.checkAuthStatus().pipe(
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        }
        // Si checkAuthStatus falla (token inválido), redirige a login.
        return router.createUrlTree(['/login']);
      })
    );
  }

  // Si no hay ni usuario ni token, redirige a login.
  return router.createUrlTree(['/login']);
};
