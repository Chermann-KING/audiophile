import { Routes } from '@angular/router';

import { LoginComponent } from './presentation/login/login.component';
import { ProfileComponent } from './presentation/profile/profile.component';

export const AUTH_ROUTES: Routes = [{ path: 'login', component: LoginComponent }];

export const PROFILE_ROUTES: Routes = [{ path: '', component: ProfileComponent }];
