import { InjectionToken } from '@angular/core';

// URL de base de l'API : valeur de configuration, fournie par la racine de composition.
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
