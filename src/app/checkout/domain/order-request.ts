import { err, ok, type Result } from '../../shared/kernel/result';
import type { OrderLine, OrderRequest, PaymentMethod } from './order';
import { computeTotals } from './order-totals';

export interface ShippingInput {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly zipCode: string;
  readonly city: string;
  readonly country: string;
}

export interface PaymentInput {
  readonly method: PaymentMethod;
  readonly emoneyNumber?: string;
  readonly emoneyPin?: string;
}

export interface CheckoutInput {
  readonly shipping: ShippingInput;
  readonly payment: PaymentInput;
  readonly lines: readonly OrderLine[];
}

export type OrderRequestError =
  | 'EMPTY_CART'
  | 'INVALID_NAME'
  | 'INVALID_EMAIL'
  | 'INVALID_PHONE'
  | 'EMPTY_ADDRESS'
  | 'INVALID_ZIP_CODE'
  | 'EMPTY_CITY'
  | 'EMPTY_COUNTRY'
  | 'INVALID_EMONEY_NUMBER'
  | 'INVALID_EMONEY_PIN';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9\s\-()]+$/;
const ZIP_CODE = /^[0-9]{5}$/;
const EMONEY_NUMBER = /^[0-9]{9}$/;
const EMONEY_PIN = /^[0-9]{4}$/;
const MIN_NAME_LENGTH = 3;

const blank = (value: string): boolean => value.trim() === '';

function shippingError(shipping: ShippingInput): OrderRequestError | null {
  if (shipping.name.trim().length < MIN_NAME_LENGTH) return 'INVALID_NAME';
  if (!EMAIL.test(shipping.email)) return 'INVALID_EMAIL';
  if (!PHONE.test(shipping.phone)) return 'INVALID_PHONE';
  if (blank(shipping.address)) return 'EMPTY_ADDRESS';
  if (!ZIP_CODE.test(shipping.zipCode)) return 'INVALID_ZIP_CODE';
  if (blank(shipping.city)) return 'EMPTY_CITY';
  if (blank(shipping.country)) return 'EMPTY_COUNTRY';
  return null;
}

function paymentError(payment: PaymentInput): OrderRequestError | null {
  if (payment.method !== 'emoney') return null;
  if (!EMONEY_NUMBER.test(payment.emoneyNumber ?? '')) return 'INVALID_EMONEY_NUMBER';
  if (!EMONEY_PIN.test(payment.emoneyPin ?? '')) return 'INVALID_EMONEY_PIN';
  return null;
}

export function createOrderRequest(input: CheckoutInput): Result<OrderRequest, OrderRequestError> {
  if (input.lines.length === 0) return err('EMPTY_CART');

  const error = shippingError(input.shipping) ?? paymentError(input.payment);
  if (error) return err(error);

  const subtotal = input.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const emoney = input.payment.method === 'emoney';

  return ok({
    ...input.shipping,
    paymentMethod: input.payment.method,
    ...(emoney ? { emoneyNumber: input.payment.emoneyNumber, emoneyPin: input.payment.emoneyPin } : {}),
    items: input.lines,
    ...computeTotals(subtotal),
  });
}
