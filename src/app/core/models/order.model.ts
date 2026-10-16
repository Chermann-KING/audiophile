export interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  productId: string;
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
  name: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
  paymentMethod: 'emoney' | 'cash';
  emoneyNumber?: string;
  emoneyPin?: string;
  items: OrderItem[];
  total: number;
  shipping: number;
  vat: number;
  subtotal: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date?: string;
}

// Commande telle qu'envoyée à l'API : l'identifiant, le statut et la date sont attribués côté serveur.
export type NewOrder = Omit<Order, 'id' | 'status' | 'date'>;

export interface OrderResponse {
  success: boolean;
  message: string;
  order: Order;
}
