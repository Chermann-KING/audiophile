import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-mobile-menu',
  standalone: false,
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  @Output() menuToggle = new EventEmitter<boolean>();

  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.menuToggle.emit(this.isOpen);

    // ?Ajoute/supprime la classe menu-open du body
    if (this.isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }
}
