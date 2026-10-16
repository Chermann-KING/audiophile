import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

@Directive({ selector: '[clickOutside]', })
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);

  readonly clickOutside = output<void>();

  @HostListener('document:click', ['$event.target'])
  onClick(target: EventTarget | null) {
    const clickedInside = this.elementRef.nativeElement.contains(target as Node | null);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
