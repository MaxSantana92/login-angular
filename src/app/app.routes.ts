import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((c) => c.Home),
    canActivate: [authGuard({ isPrivate: false })],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((c) => c.LoginComponent),
    canActivate: [authGuard({ isPrivate: false })],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((c) => c.RegisterComponent),
    canActivate: [authGuard({ isPrivate: false })],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((c) => c.DashboardComponent),
    canActivate: [authGuard({ isPrivate: true })],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
