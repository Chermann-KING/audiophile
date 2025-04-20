import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../models/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private _cartItems: CartItem[] = [];
  private _cartSubject = new BehaviorSubject<CartItem[]>([]);

  private _cartDialogSubject = new BehaviorSubject<boolean>(false);
  public cartDialogState = this._cartDialogSubject.asObservable();

  constructor() {
    // Récupère le panier depuis le localStorage au démarrage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this._cartItems = JSON.parse(savedCart);
      this._cartSubject.next(this._cartItems);
    }
  }

  // Ouvre/ferme le dialogue du panier
  toggleCartDialog(isOpen: boolean): void {
    this._cartDialogSubject.next(isOpen);

    // Gère la classe sur le body pour empêcher le défilement
    if (isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  getCart(): Observable<CartItem[]> {
    return this._cartSubject.asObservable();
  }

  getCartItemsCount(): Observable<number> {
    return new Observable<number>((observer) => {
      this.getCart().subscribe((items) => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        observer.next(count);
      });
    });
  }

  addToCart(product: Product, quantity: number): void {
    // Vérifie si le produit est déjà dans le panier
    const existingItem = this._cartItems.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      // Met à jour la quantité si le produit existe déjà
      existingItem.quantity += quantity;
    } else {
      // Ajoute un nouvel élément
      this._cartItems.push({ product, quantity });
    }

    // Met à jour le subject et sauvegarder dans le localStorage
    this._updateCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this._cartItems.find((item) => item.product.id === productId);

    if (item) {
      item.quantity = quantity;
      this._updateCart();
    }
  }

  removeFromCart(productId: number): void {
    this._cartItems = this._cartItems.filter(
      (item) => item.product.id !== productId
    );
    this._updateCart();
  }

  clearCart(): void {
    this._cartItems = [];
    this._updateCart();
  }

  private _updateCart(): void {
    this._cartSubject.next([...this._cartItems]);
    localStorage.setItem('cart', JSON.stringify(this._cartItems));
  }

  getTotal(): number {
    return this._cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }
}
