import { Component, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-mobile-menu',
    templateUrl: './mobile-menu.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  readonly menuToggle = output<boolean>();

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
