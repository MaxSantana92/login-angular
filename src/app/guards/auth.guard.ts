import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario ya está cargado en la señal, permite el acceso inmediato.
  console.log('isAuthenticated', authService.isAuthenticated());
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no hay usuario, pero sí hay un token, significa que acabamos de iniciar sesión
  // o estamos recargando la página. Debemos verificar el token y cargar el usuario.
  if (authService.getToken()) {
    return authService.checkAuthStatus().pipe(
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        }
        // Si checkAuthStatus falla (token inválido), el servicio ya hizo logout.
        // Solo necesitamos redirigir.
        return router.createUrlTree(['/login']);
      })
    );
  }

  // Si no hay ni usuario en la señal ni token, redirige a login.
  return router.createUrlTree(['/login']);
};
