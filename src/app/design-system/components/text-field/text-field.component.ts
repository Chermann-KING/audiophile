import { Component, Input, ViewEncapsulation, forwardRef, input, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
} from '@angular/forms';


@Component({
    selector: 'app-text-field',
    template: `
    <div class="form-group" [class.error]="hasError">
      @if (label) {
        <label class="form-label">{{ label }}</label>
      }
      <input
        [type]="type()"
        class="form-control"
        [placeholder]="placeholder()"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        />
        @if (hasError) {
          <div class="error-message">{{ errorMessage }}</div>
        }
      </div>
    `,
    styleUrls: ['./text-field.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextFieldComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [],
})
export class TextFieldComponent implements ControlValueAccessor {
  private _destroyRef = inject(DestroyRef);
  @Input() label = '';
  readonly placeholder = input('');
  readonly type = input('text');
  @Input() errorMessage = '';
  @Input() set formControl(control: FormControl) {
    if (control) {
      this._formControl = control;

      this._formControl.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
        this.hasError = this._formControl.invalid && this._formControl.touched;
        if (this._formControl.errors?.['required']) {
          this.errorMessage = 'Ce champ est requis';
        }
      });
    }
  }

  get formControl(): FormControl {
    return this._formControl;
  }

  private _formControl!: FormControl;
  value = '';
  hasError = false;
  touched = false;
  onChange: (value: string) => void = () => {};
  onTouch = () => {};

  writeValue(value: string | null): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouch();
    }
  }
}
