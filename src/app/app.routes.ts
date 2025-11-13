import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((c) => c.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((c) => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((c) => c.RegisterComponent),
  },
];
