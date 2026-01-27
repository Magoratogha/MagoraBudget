import { NavbarItem } from '../models';

export const NAVBAR_ITEMS: NavbarItem[] = [
  { icon: 'bi-house', route: '/home' },
  { icon: 'bi-calendar2-week', route: '/transactions' },
  { icon: 'bi-bank', route: '/accounts' },
  { icon: 'bi-card-checklist', route: '/pending' },
];

export const FIREBASE_COLLECTION_NAMES = {
  USERS: 'users'
};
