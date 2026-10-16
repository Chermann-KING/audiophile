import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrl: './logo.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class LogoComponent {

}
