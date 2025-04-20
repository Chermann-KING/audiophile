export interface OrderItem {
  id: number;
  productId: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface PaymentInfo {
  method: 'cash' | 'emoney';
  emoneyNumber?: string;
  emoneyPin?: string;
}

export interface Order {
  id?: string;
  userId: number;
  items: OrderItem[];
  shipping: ShippingInfo;
  payment: PaymentInfo;
  total: number;
  shipping_fee: number;
  vat: number;
  grandTotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}
