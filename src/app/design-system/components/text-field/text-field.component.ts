import { Component, Input, ViewEncapsulation, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-text-field',
  standalone: false,
  template: `
    <div class="form-group" [class.error]="hasError">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <input
        [type]="type"
        class="form-control"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
      <div *ngIf="hasError" class="error-message">{{ errorMessage }}</div>
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
})
export class TextFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() errorMessage = '';
  @Input() set formControl(control: FormControl) {
    if (control) {
      this._formControl = control;

      this._formControl.valueChanges.subscribe(() => {
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
  onChange = (_: any) => {};
  onTouch = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
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
