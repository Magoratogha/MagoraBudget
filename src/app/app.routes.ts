import { Routes } from '@angular/router';
import { isAuthed, isNotAuthed } from './shared/guards/auth-guard';
import { Home } from './home/pages';
import { Login } from './login/pages';

export const routes: Routes = [
  {
    path: 'home',
    component: Home,
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
    component: Login,
    canMatch: [isNotAuthed],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'not-found', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'not-found' },
];
