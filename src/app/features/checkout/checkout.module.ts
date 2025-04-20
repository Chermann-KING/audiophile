import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { DesignSystemModule } from '../../design-system/design-system.module';

import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { CheckoutSummaryComponent } from './components/checkout-summary/checkout-summary.component';
import { OrderConfirmationModalService } from './services/order-confirmation-modal.service';

const routes: Routes = [
  {
    path: '',
    component: CheckoutComponent,
  },
];

@NgModule({
  declarations: [
    CheckoutComponent,
    CheckoutSummaryComponent,
    OrderConfirmationComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    DesignSystemModule,
    RouterModule.forChild(routes),
  ],
  providers: [OrderConfirmationModalService],
})
export class CheckoutModule {}
