import {
  Component,
  ViewEncapsulation,
  output,
  input
} from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [NgClass],
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'text' | 'dark'>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly buttonClick = output<Event>();

  get buttonClass(): string {
    return `btn-${this.variant()}`;
  }

  onClick(event: Event): void {
    console.log('Bouton cliqué avec la classe:', this.buttonClass);
    this.buttonClick.emit(event);
  }
}
