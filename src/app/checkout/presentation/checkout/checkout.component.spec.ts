import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AccountStore } from '../../../account/presentation/account.store';
import { CartStore } from '../../../cart/presentation/cart.store';
import { aCartProduct } from '../../../cart/testing/cart.fixture';
import { PlaceOrder } from '../../application/place-order.use-case';
import type { Order } from '../../domain/order';
import { createOrderRequest } from '../../domain/order-request';
import { aCheckoutInput } from '../../testing/checkout.fixture';
import { OrderConfirmationStore } from '../order-confirmation.store';
import { CheckoutComponent } from './checkout.component';

const VALID_FORM = {
  name: 'Alexei Ward',
  email: 'alexei@example.com',
  phone: '+1 202 5501136',
  address: '1137 Williams Avenue',
  zipCode: '10001',
  city: 'New York',
  country: 'United States',
  paymentMethod: 'cash' as const,
  emoneyNumber: '',
  emoneyPin: '',
};

const placed = (() => {
  const request = createOrderRequest(aCheckoutInput());
  if (!request.ok) throw new Error('fixture invalide');
  return { ...request.value, id: 'order-1' } as Order;
})();

const setup = (outcome: { ok: true; value: Order } | { ok: false; error: unknown } = { ok: true, value: placed }) => {
  const execute = vi.fn(async () => outcome);
  const cart = {
    lines: () => [{ ...aCartProduct({ productId: 'a', unitPrice: 100 }), quantity: 2 }],
    total: () => 200,
    clear: vi.fn(),
  };
  const confirmation = new OrderConfirmationStore();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: PlaceOrder, useValue: { execute } },
      { provide: CartStore, useValue: cart },
      { provide: AccountStore, useValue: { user: () => null } },
      { provide: OrderConfirmationStore, useValue: confirmation },
    ],
  });
  const fixture = TestBed.createComponent(CheckoutComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, execute, cart, confirmation };
};

describe('CheckoutComponent', () => {
  it('calcule les totaux à partir du panier', () => {
    const { component } = setup();
    expect({ total: component.total(), shipping: component.shipping(), vat: component.vat(), grand: component.grandTotal() }).toEqual({
      total: 200,
      shipping: 50,
      vat: 40,
      grand: 250,
    });
  });

  it('ne passe pas la commande quand le formulaire est invalide', async () => {
    const { component, execute } = setup();

    await component.onSubmit();

    expect(execute).not.toHaveBeenCalled();
    expect(component.isFieldInvalid('name')).toBe(true);
  });

  it('passe la commande, affiche la confirmation et vide le panier', async () => {
    const { component, execute, cart, confirmation } = setup();
    component.checkoutForm.setValue(VALID_FORM);

    await component.onSubmit();

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ shipping: expect.objectContaining({ name: 'Alexei Ward' }), payment: expect.objectContaining({ method: 'cash' }) })
    );
    expect(confirmation.order()).toEqual(placed);
    expect(cart.clear).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  it('conserve le panier quand la commande échoue', async () => {
    const { component, cart, confirmation } = setup({ ok: false, error: { kind: 'NETWORK' } });
    component.checkoutForm.setValue(VALID_FORM);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await component.onSubmit();

    expect(cart.clear).not.toHaveBeenCalled();
    expect(confirmation.visible()).toBe(false);
    expect(component.loading()).toBe(false);
  });

  it('exige les coordonnées e-Money seulement pour ce moyen de paiement', () => {
    const { component } = setup();
    component.checkoutForm.setValue({ ...VALID_FORM, paymentMethod: 'emoney' });

    expect(component.showEMoneyDetails()).toBe(true);
    expect(component.checkoutForm.valid).toBe(false);
    expect(component.getErrorMessage('emoneyNumber')).toBe('Ce champ est obligatoire');

    component.checkoutForm.setValue({ ...VALID_FORM, paymentMethod: 'cash' });
    expect(component.showEMoneyDetails()).toBe(false);
    expect(component.checkoutForm.valid).toBe(true);
  });
});
