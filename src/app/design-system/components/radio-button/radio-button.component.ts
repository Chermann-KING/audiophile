import {
  Component,
  Input,
  ViewEncapsulation,
  output,
  input
} from '@angular/core';

@Component({
    selector: 'app-radio-button',
    template: `
    <div class="radio-container" [class.active]="checked">
      <input
        type="radio"
        class="radio-input"
        [id]="id"
        [name]="name()"
        [value]="value()"
        [checked]="checked"
        (change)="onRadioChange($event)"
      />
      <label [for]="id" class="radio-label">
        <span class="radio-custom"></span>
        {{ label() }}
      </label>
    </div>
  `,
    styleUrls: ['./radio-button.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class RadioButtonComponent {
  readonly label = input('');
  readonly value = input('');
  readonly name = input('');
  @Input() checked = false;
  readonly change = output<string>();

  get id(): string {
    return `radio-${this.name()}-${this.value()}`;
  }

  onRadioChange(event: Event): void {
    this.checked = (event.target as HTMLInputElement).checked;
    if (this.checked) {
      this.change.emit(this.value());
    }
  }
}
