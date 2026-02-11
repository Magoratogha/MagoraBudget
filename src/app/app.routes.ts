import { Routes } from '@angular/router';
import { isAuthed, isNotAuthed } from './shared/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/pages/home/home').then((m) => m.Home),
    canMatch: [isAuthed],
  },
  {
    path: 'accounts',
    loadComponent: () => import('./accounts/pages/accounts/accounts').then((m) => m.Accounts),
    canMatch: [isAuthed],
  },
  {
    path: 'pending',
    loadComponent: () => import('./pending/pages/pending/pending').then((m) => m.Pending),
    canMatch: [isAuthed],
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transactions/pages/transactions/transactions').then((m) => m.Transactions),
    canMatch: [isAuthed],
  },
  {
    path: 'login',
    loadComponent: () => import('./login/pages/login/login').then((m) => m.Login),
    canMatch: [isNotAuthed],
  },
  { path: 'not-found', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'not-found' },
];
