import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  navItems = [
    { label: 'HOME', route: '/' },
    { label: 'HEADPHONES', route: '/categories/headphones' },
    { label: 'SPEAKERS', route: '/categories/speakers' },
    { label: 'EARPHONES', route: '/categories/earphones' },
  ];
}
