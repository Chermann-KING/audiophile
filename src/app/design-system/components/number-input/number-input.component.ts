import {
  Component,
  Input,
  ViewEncapsulation,
  output
} from '@angular/core';

@Component({
    selector: 'app-number-input',
    template: `
    <div class="number-input">
      <button
        type="button"
        class="number-btn"
        [disabled]="value <= min"
        (click)="decrement()"
      >
        -
      </button>
      <div class="number-value">{{ value }}</div>
      <button
        type="button"
        class="number-btn"
        [disabled]="value >= max"
        (click)="increment()"
      >
        +
      </button>
    </div>
  `,
    styleUrls: ['./number-input.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NumberInputComponent {
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  readonly valueChange = output<number>();

  increment(): void {
    if (this.value < this.max) {
      this.value++;
      this.valueChange.emit(this.value);
    }
  }

  decrement(): void {
    if (this.value > this.min) {
      this.value--;
      this.valueChange.emit(this.value);
    }
  }
}
