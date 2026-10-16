import { Routes } from '@angular/router';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderConfirmationModalService } from './services/order-confirmation-modal.service';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    component: CheckoutComponent,
    providers: [OrderConfirmationModalService],
  },
];
