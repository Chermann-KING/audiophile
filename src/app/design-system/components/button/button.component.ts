import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'text' | 'dark' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Output() buttonClick = new EventEmitter<Event>();

  get buttonClass(): string {
    return `btn-${this.variant}`;
  }

  onClick(event: Event): void {
    console.log('Bouton cliqué avec la classe:', this.buttonClass);
    this.buttonClick.emit(event);
  }
}
