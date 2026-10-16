// src/app/shared/components/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';
import { LogoComponent } from '../logo/logo.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { UserIconComponent } from '../icons/user-icon.component';
import { RouterLink } from '@angular/router';
import { CartComponent } from '../cart/cart.component';
import { AsyncPipe } from '@angular/common';

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
        AsyncPipe,
    ],
})
export class HeaderComponent implements OnInit {
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

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
    this.authService.logout();
    this.closeUserMenu();
  }
}
