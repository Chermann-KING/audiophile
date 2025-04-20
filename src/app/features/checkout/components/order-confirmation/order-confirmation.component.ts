import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Order, OrderResponse } from '../../../../core/models/order.model';
import { OrderConfirmationModalService } from '../../services/order-confirmation-modal.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: false,
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  showAllItems = false;
  displayedItems = 1;
  loading = false;
  isVisible$: Observable<boolean>;

  constructor(
    private _router: Router,
    private _modalService: OrderConfirmationModalService,
    private _cdr: ChangeDetectorRef
  ) {
    this.isVisible$ = this._modalService.isVisible$;
    this._modalService.orderData$.subscribe(
      (orderData: Order | OrderResponse | null) => {
        if (orderData) {
          this.order = 'order' in orderData ? orderData.order : orderData;
          console.log('Ordre reçu dans la modale:', this.order);
          this._cdr.markForCheck();
        }
      }
    );
  }

  ngOnInit(): void {
    this.isVisible$.subscribe((visible) => {
      console.log('État de visibilité de la modal:', visible);
      this._cdr.markForCheck();
    });
  }

  get visibleItems() {
    if (!this.order?.items?.length) return [];
    return this.showAllItems
      ? this.order.items
      : this.order.items.slice(0, this.displayedItems);
  }

  get remainingItems(): number {
    if (!this.order?.items?.length) return 0;
    return Math.max(0, this.order.items.length - this.displayedItems);
  }

  toggleItemsVisibility(): void {
    this.showAllItems = !this.showAllItems;
    this._cdr.markForCheck();
  }

  backToHome(): void {
    this._modalService.hideModal();
    this._router.navigate(['/']);
  }
}
