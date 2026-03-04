import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { enableMainThreadBlocking } from "ios-vibrator-pro-max";

enableMainThreadBlocking(true);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
