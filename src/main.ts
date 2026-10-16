import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './app/core/core.module';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, RouterModule, AppRoutingModule, RouterModule, FormsModule, ReactiveFormsModule, CoreModule),
        provideHttpClient(withFetch())
    ]
})
  .catch(err => console.error(err));
