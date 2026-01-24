import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('./home/pages/home/home').then(m => m.Home) },
  { path: 'accounts', loadComponent: () => import('./accounts/pages/accounts/accounts').then(m => m.Accounts) },
  { path: 'pending', loadComponent: () => import('./pending/pages/pending/pending').then(m => m.Pending) },
  {
    path: 'transactions',
    loadComponent: () => import('./transactions/pages/transactions/transactions').then(m => m.Transactions)
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
