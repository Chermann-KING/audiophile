// src/app/shared/components/header/header.component.ts
import { Component, inject } from '@angular/core';
import { AccountStore } from '../../../account/presentation/account.store';
import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';
import { LogoComponent } from '../logo/logo.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { UserIconComponent } from '../icons/user-icon.component';
import { RouterLink } from '@angular/router';
import { CartComponent } from '../../../cart/presentation/cart/cart.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [
        MobileMenuComponent,
        LogoComponent,
        NavbarComponent,
        ClickOutsideDirective,
        UserIconComponent,
        RouterLink,
        CartComponent,
    ],
})
export class HeaderComponent {
  protected readonly account = inject(AccountStore);

  isUserMenuOpen = false;
  isMobileMenuOpen = false;

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  onMenuToggle(isOpen: boolean): void {
    this.isMobileMenuOpen = isOpen;
  }

  logout(): void {
    this.account.signOut();
    this.closeUserMenu();
  }
}
