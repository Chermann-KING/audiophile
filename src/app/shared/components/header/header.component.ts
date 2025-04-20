// src/app/shared/components/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
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
