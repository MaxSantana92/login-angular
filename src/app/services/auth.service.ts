import { Injectable, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { tap, catchError, map, Observable, of, delay } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private notificationService = inject(NotificationService);
  private loginUrl = 'https://dummyjson.com/auth/login';
  private profileUrl = 'https://dummyjson.com/auth/me';
  private tokenKey = 'auth_token';

  // 1. Estado Reactivo: Fuente de verdad del usuario
  currentUser = signal<User | null>(null);

  // Signal computada para saber fácilmente si está logueado
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    // La lógica de inicialización se moverá a un APP_INITIALIZER
  }

  // --- LOGIN ---
  login(credentials: { username: string; password: string }): Observable<boolean> {
    return this.http.post<any>(this.loginUrl, credentials).pipe(
      delay(3000),
      tap((response) => {
        this.saveToken(response.accessToken);
      }),
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        const errorMessage = err.error?.message || 'An unknown error occurred';
        this.notificationService.showError(errorMessage);
        this.logout();
        return of(false);
      })
    );
  }

  // --- CHECK STATUS (Para F5 / Recargas) ---
  checkAuthStatus(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return of(false);
    }

    // Hacemos una petición para validar el token y traer datos frescos
    return this.http.get<User>(this.profileUrl).pipe(
      tap((user) => {
        if (user) {
          this.currentUser.set(user);
        }
      }),
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  // --- LOGOUT ---
  logout() {
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  // --- UTILIDADES TOKEN (PLATFORM-AWARE) ---
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }
}
