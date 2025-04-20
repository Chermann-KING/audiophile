import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { UserService } from '../../../../core/services/user.service';
import { take } from 'rxjs/operators';
import { OrderConfirmationModalService } from '../../services/order-confirmation-modal.service';
import { Order, OrderResponse } from '../../../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  total = 0;
  shipping = 50; // Frais de livraison fixes
  vat = 0; // TVA
  grandTotal = 0;
  selectedPaymentMethod: string = 'cash';
  showEMoneyDetails: boolean = false;
  loading = false;

  constructor(
    private _fb: FormBuilder,
    private _cartService: CartService,
    private _orderService: OrderService,
    private _userService: UserService,
    private _router: Router,
    private _modalService: OrderConfirmationModalService
  ) {}

  ngOnInit(): void {
    this._initForm();
    this._loadCartData();

    // Observer les changements de méthode de paiement
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe((method) => {
      this.selectedPaymentMethod = method;
      this.showEMoneyDetails = method === 'emoney';

      // Ajuster les validateurs selon la méthode de paiement
      if (method === 'emoney') {
        this.checkoutForm
          .get('emoneyNumber')
          ?.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]{9}$'),
          ]);
        this.checkoutForm
          .get('emoneyPin')
          ?.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]{4}$'),
          ]);
      } else {
        this.checkoutForm.get('emoneyNumber')?.clearValidators();
        this.checkoutForm.get('emoneyPin')?.clearValidators();
      }

      this.checkoutForm.get('emoneyNumber')?.updateValueAndValidity();
      this.checkoutForm.get('emoneyPin')?.updateValueAndValidity();
    });
  }

  private _initForm(): void {
    this.checkoutForm = this._fb.group({
      // Informations de facturation
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern('^\\+?[0-9\\s\\-\\(\\)]+$')],
      ],

      // Informations de livraison
      address: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],

      // Informations de paiement
      paymentMethod: ['cash', [Validators.required]],
      emoneyNumber: [''],
      emoneyPin: [''],
    });

    // Pre-fill form with user data if available
    this._userService
      .getCurrentUser()
      .pipe(take(1))
      .subscribe((user) => {
        if (user) {
          this.checkoutForm.patchValue({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          });

          // Marquer les champs pré-remplis comme touchés
          const nameControl = this.checkoutForm.get('name');
          const emailControl = this.checkoutForm.get('email');

          if (nameControl) {
            nameControl.markAsTouched();
            nameControl.updateValueAndValidity();
          }

          if (emailControl) {
            emailControl.markAsTouched();
            emailControl.updateValueAndValidity();
          }
        }
      });
  }

  private _loadCartData(): void {
    this._cartService.getCart().subscribe((items) => {
      this.cartItems = items;
      this._calculateTotals();
    });
  }

  private _calculateTotals(): void {
    this.total = this._cartService.getTotal();
    this.vat = Math.round(this.total * 0.2); // 20% de TVA
    this.grandTotal = this.total + this.shipping;
  }

  onSubmit(): void {
    console.log('3. Méthode onSubmit appelée dans CheckoutComponent');
    console.log('Form valide:', this.checkoutForm.valid);
    console.log('Form values:', this.checkoutForm.value);
    console.log('Form errors:', this.checkoutForm.errors);

    if (this.checkoutForm.valid) {
      this.loading = true;
      console.log('4. Formulaire valide, préparation de la commande');

      const orderData = {
        ...this.checkoutForm.value,
        items: this.cartItems.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image.desktop,
          productId: item.product.id,
        })),
        total: this.grandTotal,
        shipping: this.shipping,
        vat: this.vat,
        subtotal: this.total,
      };

      console.log('5. Données de la commande:', orderData);

      this._orderService.createOrder(orderData).subscribe({
        next: (response: Order | OrderResponse) => {
          console.log('6. Commande créée avec succès:', response);
          const order = 'order' in response ? response.order : response;
          this._modalService.showModal(order);
          this._cartService.clearCart();
          this.loading = false;
        },
        error: (error) => {
          console.error('7. Erreur lors de la création de la commande:', error);
          this.loading = false;
        },
      });
    } else {
      console.log('8. Formulaire invalide, affichage des erreurs');
      console.log('Erreurs détaillées:', this.getFormValidationErrors());
      this._markFormGroupTouched(this.checkoutForm);
    }
  }

  // Nouvelle méthode pour obtenir les erreurs détaillées
  private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.checkoutForm.controls).forEach((key) => {
      const control = this.checkoutForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Méthode utilitaire pour marquer tous les champs comme touchés
  private _markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this._markFormGroupTouched(control);
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  // Vérifie si un champ est invalide et a été touché
  isFieldInvalid(fieldName: string): boolean {
    const control = this.checkoutForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // Obtenient le message d'erreur pour un champ
  getErrorMessage(fieldName: string): string {
    const control = this.checkoutForm.get(fieldName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ce champ est obligatoire';
    }

    if (control.hasError('email')) {
      return "Format d'email invalide";
    }

    if (control.hasError('minlength')) {
      return `Minimum ${
        control.getError('minlength').requiredLength
      } caractères`;
    }

    if (control.hasError('pattern')) {
      switch (fieldName) {
        case 'phone':
          return 'Format de téléphone invalide';
        case 'zipCode':
          return 'Code postal invalide (5 chiffres)';
        case 'emoneyNumber':
          return 'Numéro e-Money invalide (9 chiffres)';
        case 'emoneyPin':
          return 'PIN e-Money invalide (4 chiffres)';
        default:
          return 'Format invalide';
      }
    }

    return '';
  }
}
