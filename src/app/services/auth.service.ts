import { Injectable, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { tap, catchError, map, Observable, of, switchMap } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { NotificationService } from './notification.service';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private notificationService = inject(NotificationService);
  private baseUrl = 'https://dummyjson.com/auth';
  private accessTokenKey = 'auth_access_token';
  private refreshTokenKey = 'auth_refresh_token';

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  login(credentials: { username: string; password: string }): Observable<boolean> {
    const body = {
      ...credentials,
      expiresInMins: 1, // Token expira en 1 minuto para probar el refresh
    };
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, body).pipe(
      tap((response) => {
        console.log('Login successful, tokens saved. Access token:', response.accessToken);
        this.saveTokens(response);
      }),
      switchMap(() => this.loadUserProfile()),
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        const errorMessage = err.error?.message || 'An unknown error occurred';
        this.notificationService.showError(errorMessage);
        this.logout();
        return of(false);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken });
  }

  checkAuthStatus(): Observable<boolean> {
    const token = this.getAccessToken();
    if (!token) {
      this.logout();
      return of(false);
    }

    return this.loadUserProfile().pipe(
      map(() => true),
      catchError(() => {
        return of(false);
      })
    );
  }

  loadUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap((user) => {
        if (user) {
          this.currentUser.set(user);
        }
      }),
      catchError((error) => {
        this.notificationService.showError('Your session has expired. Please log in again.');
        throw error;
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.accessTokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.accessTokenKey);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  saveTokens(tokens: AuthResponse) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.accessTokenKey, tokens.accessToken);
      localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    }
  }
}
