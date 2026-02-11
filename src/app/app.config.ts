import {
  ApplicationConfig,
  inject,
  isDevMode,
  LOCALE_ID,
  PLATFORM_ID,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer
} from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { FIREBASE_CONFIG, RECAPTCHA_CONFIG } from '../../firebase-options';
import { provideServiceWorker } from '@angular/service-worker';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  provideFirestore
} from '@angular/fire/firestore';
import { initializeAppCheck, provideAppCheck, ReCaptchaEnterpriseProvider } from '@angular/fire/app-check';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { isPlatformBrowser, registerLocaleData } from '@angular/common';
import localeES from '@angular/common/locales/es-CO';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

registerLocaleData(localeES);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(FIREBASE_CONFIG)),
    provideAuth(() => {
      const auth = getAuth();
      if (isPlatformBrowser(inject(PLATFORM_ID)) && location.hostname === 'localhost') {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      }
      return auth;
    }),
    provideFirestore(() => {
      let firestore;
      if (isPlatformBrowser(inject(PLATFORM_ID))) {
        firestore = initializeFirestore(getApp(), {
          localCache: persistentLocalCache()
        });
      } else {
        firestore = getFirestore(getApp());
      }
      if (isPlatformBrowser(inject(PLATFORM_ID)) && location.hostname === 'localhost') {
        connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      }
      return firestore;
    }),
    provideEnvironmentInitializer(() => {
      if (isPlatformBrowser(inject(PLATFORM_ID))) {
        provideAppCheck(() =>
          initializeAppCheck(getApp(), {
            provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_CONFIG.reCaptchaKey),
            isTokenAutoRefreshEnabled: true
          })
        )
      }
      return;
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', floatLabel: 'always' } },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    provideEnvironmentNgxMask(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch())
  ],
};
