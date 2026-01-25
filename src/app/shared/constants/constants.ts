import { NavbarItem } from '../models';

export const NAVBAR_ITEMS: NavbarItem[] = [
  { label: 'Inicio', icon: 'bi-house', route: '/home' },
  { label: 'Transacciones', icon: 'bi-calendar2-week', route: '/transactions' },
  { label: 'Cuentas', icon: 'bi-bank', route: '/accounts' },
  //{ label: 'Pendientes', icon: 'bi-card-checklist', route: '/pending' },
  { label: 'Pendientes', icon: 'bi-card-checklist', route: '/login' },
];
