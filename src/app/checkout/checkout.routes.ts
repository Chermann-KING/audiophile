import { Routes } from '@angular/router';

import { OrderConfirmationStore } from './presentation/order-confirmation.store';
import { CheckoutComponent } from './presentation/checkout/checkout.component';

// La fenêtre de confirmation n'existe que le temps de la visite de la page de commande.
export const CHECKOUT_ROUTES: Routes = [
  { path: '', component: CheckoutComponent, providers: [OrderConfirmationStore] },
];
