import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
  },
];

@NgModule({
    imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ProfileComponent,
],
})
export class ProfileModule {}
