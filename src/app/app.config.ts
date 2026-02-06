import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { FIREBASE_CONFIG, RECAPTCHA_CONFIG } from '../../firebase-options';
import { provideServiceWorker } from '@angular/service-worker';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  provideFirestore
} from '@angular/fire/firestore';
import { initializeAppCheck, provideAppCheck, ReCaptchaEnterpriseProvider } from '@angular/fire/app-check';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideEnvironmentNgxMask } from 'ngx-mask';

declare global {
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

if (location.hostname === 'localhost') {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(FIREBASE_CONFIG)),
    provideAuth(() => {
      const auth = getAuth();
      if (location.hostname === 'localhost') {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = initializeFirestore(getApp(), {
        localCache: persistentLocalCache()
      });
      if (location.hostname === 'localhost') {
        connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      }
      return firestore;
    }),
    provideAppCheck(() => initializeAppCheck(getApp(), {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_CONFIG.reCaptchaKey),
      isTokenAutoRefreshEnabled: true
    })),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', floatLabel: 'always' } },
    provideEnvironmentNgxMask()
  ],
};
