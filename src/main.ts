/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TokenInterceptor } from './app/interceptors/token.interceptor';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([TokenInterceptor])),
    ...appConfig.providers,
   [provideRouter(routes)],
  ]
})
  .catch((err) => console.error(err));