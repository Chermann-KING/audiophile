import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DesignSystemModule } from '../design-system/design-system.module';
import { LogoComponent } from './components/logo/logo.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MobileMenuComponent } from './components/mobile-menu/mobile-menu.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartComponent } from './components/cart/cart.component';
import { CartDialogComponent } from './components/cart-dialog/cart-dialog.component';
import { AboutComponent } from './components/about/about.component';
import { HeaderComponent } from './components/header/header.component';
import { UserIconComponent } from './components/icons/user-icon.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  declarations: [
    LogoComponent,
    NavbarComponent,
    CartComponent,
    FooterComponent,
    MobileMenuComponent,
    AboutComponent,
    CartDialogComponent,
    HeaderComponent,
    UserIconComponent,
    ClickOutsideDirective,
  ],
  imports: [CommonModule, RouterModule, DesignSystemModule],
  exports: [
    CartDialogComponent,
    FooterComponent,
    AboutComponent,
    RouterModule,
    MobileMenuComponent,
    NavbarComponent,
    CartComponent,
    HeaderComponent,
    UserIconComponent,
    ClickOutsideDirective,
  ],
})
export class SharedModule {}
