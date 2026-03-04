import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import "ios-vibrator-pro-max";

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
