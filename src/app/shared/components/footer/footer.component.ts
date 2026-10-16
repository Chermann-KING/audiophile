import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [LogoComponent, NavbarComponent],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
