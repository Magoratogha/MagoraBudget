import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import { FIREBASE_CONFIG } from '../../firebase-options';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(FIREBASE_CONFIG)),
  ]
};
