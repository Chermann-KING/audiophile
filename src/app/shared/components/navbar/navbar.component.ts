import { Component } from '@angular/core';

import { RouterLinkActive, RouterLink } from '@angular/router';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    imports: [
    RouterLinkActive,
    RouterLink
],
})
export class NavbarComponent {
  navItems = [
    { label: 'HOME', route: '/' },
    { label: 'HEADPHONES', route: '/categories/headphones' },
    { label: 'SPEAKERS', route: '/categories/speakers' },
    { label: 'EARPHONES', route: '/categories/earphones' },
  ];
}
