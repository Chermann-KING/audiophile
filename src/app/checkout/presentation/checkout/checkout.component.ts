import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { AccountStore } from '../../../account/presentation/account.store';
import { CartStore } from '../../../cart/presentation/cart.store';
import { PlaceOrder, type PlaceOrderError } from '../../application/place-order.use-case';
import type { OrderLine } from '../../domain/order';
import { computeTotals } from '../../domain/order-totals';
import { CheckoutSummaryComponent } from '../checkout-summary/checkout-summary.component';
import { OrderConfirmationStore } from '../order-confirmation.store';
import { OrderConfirmationComponent } from '../order-confirmation/order-confirmation.component';

type PaymentMethod = 'cash' | 'emoney';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, CheckoutSummaryComponent, OrderConfirmationComponent],
})
export class CheckoutComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly cart = inject(CartStore);
  private readonly account = inject(AccountStore);
  private readonly placeOrder = inject(PlaceOrder);
  private readonly confirmation = inject(OrderConfirmationStore);

  readonly checkoutForm = this.fb.group({
    // Informations de facturation
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9\\s\\-\\(\\)]+$')]],

    // Informations de livraison
    address: ['', [Validators.required]],
    zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
    city: ['', [Validators.required]],
    country: ['', [Validators.required]],

    // Informations de paiement
    paymentMethod: ['cash' as PaymentMethod, [Validators.required]],
    emoneyNumber: [''],
    emoneyPin: [''],
  });

  readonly cartItems = this.cart.lines;
  readonly totals = computed(() => computeTotals(this.cart.total()));
  readonly total = computed(() => this.totals().subtotal);
  readonly shipping = computed(() => this.totals().shipping);
  readonly vat = computed(() => this.totals().vat);
  readonly grandTotal = computed(() => this.totals().total);
  readonly selectedPaymentMethod = signal<PaymentMethod>('cash');
  readonly showEMoneyDetails = signal(false);
  readonly loading = signal(false);
  readonly submitError = signal<string | null>(null);

  ngOnInit(): void {
    this.prefillFromAccount();
    this.checkoutForm.controls.paymentMethod.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((method) => this.onPaymentMethodChange(method ?? 'cash'));
  }

  async onSubmit(): Promise<void> {
    if (!this.checkoutForm.valid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.submitError.set(null);
    const result = await this.placeOrder.execute(this.toCheckoutInput());

    if (result.ok) {
      this.confirmation.show(result.value);
      this.cart.clear();
    } else {
      console.error('Erreur lors de la création de la commande:', result.error);
      this.submitError.set(messageOf(result.error));
    }
    this.loading.set(false);
  }

  goBack(): void {
    window.history.back();
  }

  // Vérifie si un champ est invalide et a été touché
  isFieldInvalid(fieldName: string): boolean {
    const control = this.checkoutForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // Obtient le message d'erreur pour un champ
  getErrorMessage(fieldName: string): string {
    const control = this.checkoutForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) return 'Ce champ est obligatoire';
    if (control.hasError('email')) return "Format d'email invalide";
    if (control.hasError('minlength')) {
      return `Minimum ${control.getError('minlength').requiredLength} caractères`;
    }
    if (control.hasError('pattern')) return PATTERN_MESSAGES[fieldName] ?? 'Format invalide';
    return '';
  }

  private toCheckoutInput() {
    const form = this.checkoutForm.getRawValue();
    const lines: OrderLine[] = this.cartItems().map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      image: item.imageUrl,
    }));

    return {
      shipping: {
        name: form.name ?? '',
        email: form.email ?? '',
        phone: form.phone ?? '',
        address: form.address ?? '',
        zipCode: form.zipCode ?? '',
        city: form.city ?? '',
        country: form.country ?? '',
      },
      payment: {
        method: form.paymentMethod ?? 'cash',
        emoneyNumber: form.emoneyNumber ?? '',
        emoneyPin: form.emoneyPin ?? '',
      },
      lines,
    };
  }

  private prefillFromAccount(): void {
    const user = this.account.user();
    if (!user) return;

    this.checkoutForm.patchValue({ name: `${user.firstName} ${user.lastName}`, email: user.email });
    // Marque les champs pré-remplis comme touchés
    for (const control of [this.checkoutForm.controls.name, this.checkoutForm.controls.email]) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  // Les coordonnées e-Money ne sont exigées que pour ce moyen de paiement.
  private onPaymentMethodChange(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
    this.showEMoneyDetails.set(method === 'emoney');

    const { emoneyNumber, emoneyPin } = this.checkoutForm.controls;
    if (method === 'emoney') {
      emoneyNumber.setValidators([Validators.required, Validators.pattern('^[0-9]{9}$')]);
      emoneyPin.setValidators([Validators.required, Validators.pattern('^[0-9]{4}$')]);
    } else {
      emoneyNumber.clearValidators();
      emoneyPin.clearValidators();
    }
    emoneyNumber.updateValueAndValidity();
    emoneyPin.updateValueAndValidity();
  }
}

// Message affiché à l'utilisateur : les détails techniques restent dans la console.
function messageOf(error: PlaceOrderError): string {
  if (typeof error === 'string') {
    return error === 'EMPTY_CART'
      ? 'Votre panier est vide.'
      : 'Certaines informations de la commande sont invalides, veuillez les vérifier.';
  }
  return error.kind === 'NETWORK'
    ? 'Impossible de joindre le serveur : vérifiez votre connexion et réessayez.'
    : 'Le serveur a refusé la commande, veuillez réessayer plus tard.';
}

const PATTERN_MESSAGES: Record<string, string> = {
  phone: 'Format de téléphone invalide',
  zipCode: 'Code postal invalide (5 chiffres)',
  emoneyNumber: 'Numéro e-Money invalide (9 chiffres)',
  emoneyPin: 'PIN e-Money invalide (4 chiffres)',
};
