import { Component, Input, ViewEncapsulation, forwardRef, input, DestroyRef, inject, signal, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
} from '@angular/forms';


@Component({
    selector: 'app-text-field',
    template: `
    <div class="form-group" [class.error]="hasError()">
      @if (label) {
        <label class="form-label" [for]="inputId">{{ label }}</label>
      }
      <input
        [id]="inputId"
        [type]="type()"
        class="form-control"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        />
        @if (hasError()) {
          <div class="error-message">{{ errorMessage() }}</div>
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
    imports: [],
})
export class TextFieldComponent implements ControlValueAccessor {
  private static nextId = 0;
  readonly inputId = `text-field-${TextFieldComponent.nextId++}`;
  private _destroyRef = inject(DestroyRef);
  @Input() label = '';
  readonly placeholder = input('');
  readonly type = input('text');
  // model() : saisie du parent, mais aussi renseigné en interne (champ requis).
  readonly errorMessage = model('');
  @Input() set formControl(control: FormControl) {
    if (control) {
      this._formControl = control;

      this._formControl.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
        this.hasError.set(this._formControl.invalid && this._formControl.touched);
        if (this._formControl.errors?.['required']) {
          this.errorMessage.set('Ce champ est requis');
        }
      });
    }
  }

  get formControl(): FormControl {
    return this._formControl;
  }

  private _formControl!: FormControl;
  readonly value = signal('');
  readonly hasError = signal(false);
  touched = false;
  // Implémentations vides tant que le formulaire n'a pas enregistré ses callbacks.
  onChange: (value: string) => void = () => undefined;
  onTouch: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouch();
    }
  }
}
