export type PaymentMethod = 'cash' | 'emoney';

export interface OrderLine {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
  readonly quantity: number;
  readonly image: string;
}

// Commande telle que l'API l'échange : coordonnées de livraison à plat, totaux calculés.
export interface OrderRequest {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly zipCode: string;
  readonly city: string;
  readonly country: string;
  readonly paymentMethod: PaymentMethod;
  readonly emoneyNumber?: string;
  readonly emoneyPin?: string;
  readonly items: readonly OrderLine[];
  readonly subtotal: number;
  readonly shipping: number;
  readonly vat: number;
  readonly total: number;
}

// Commande enregistrée : l'identifiant, le statut et la date sont attribués par le serveur.
export interface Order extends OrderRequest {
  readonly id?: string;
  readonly status?: string;
  readonly date?: string;
}

export type OrderHistoryStatus = 'pending' | 'completed';
