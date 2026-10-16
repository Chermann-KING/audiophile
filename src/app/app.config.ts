import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
import { API_BASE_URL } from './core/api-base-url';
import { provideAccount } from './account/infrastructure/account.providers';
import { provideCart } from './cart/infrastructure/cart.providers';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    ...provideCart(),
    ...provideAccount(),
    { provide: API_BASE_URL, useValue: environment.apiUrl },
  ],
};
