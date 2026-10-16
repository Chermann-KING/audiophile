import { Component } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    imports: [LogoComponent, NavbarComponent],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
