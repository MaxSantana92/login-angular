import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((c) => c.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((c) => c.LoginComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((c) => c.RegisterComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((c) => c.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
