import {
  Component,
  ViewEncapsulation,
  input,
  model
} from '@angular/core';

@Component({
    selector: 'app-number-input',
    template: `
    <div class="number-input">
      <button
        type="button"
        class="number-btn"
        [disabled]="value() <= min()"
        (click)="decrement()"
      >
        -
      </button>
      <div class="number-value">{{ value() }}</div>
      <button
        type="button"
        class="number-btn"
        [disabled]="value() >= max()"
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
  // model() conserve le comportement d'origine : la valeur est modifiée localement et `valueChange` est émis.
  readonly value = model(0);
  readonly min = input(0);
  readonly max = input(100);

  increment(): void {
    if (this.value() < this.max()) {
      this.value.update((current) => current + 1);
    }
  }

  decrement(): void {
    if (this.value() > this.min()) {
      this.value.update((current) => current - 1);
    }
  }
}
