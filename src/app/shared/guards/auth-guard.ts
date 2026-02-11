import { CanMatchFn, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Auth } from '@angular/fire/auth';

export const isNotAuthed: CanMatchFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router)
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId))
    return true;

  await auth.authStateReady();
  return auth.currentUser ? router.createUrlTree(['/home']) : true;
};

export const isAuthed: CanMatchFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router)
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId))
    return true;

  await auth.authStateReady();
  return auth.currentUser ? true : router.createUrlTree(['/login']);
};
