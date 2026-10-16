import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { OrderService } from '../../../../core/services/order.service';
import { User } from '../../../../core/models/user.model';
import { Order } from '../../../../core/models/order.model';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CurrencyPipe,
        DatePipe,
    ],
})
export class ProfileComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _userService = inject(UserService);
  private _orderService = inject(OrderService);

  profileForm: FormGroup;
  passwordForm: FormGroup;
  readonly activeTab = signal<'profile' | 'orders'>('profile');
  readonly currentOrders = signal<Order[]>([]);
  readonly orderHistory = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  currentUser: User | null = null;

  constructor() {
    this.profileForm = this._fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: [''],
    });

    this.passwordForm = this._fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.loading.set(true);
    // ?Simuler la récupération des données utilisateur
    of({
      id: '1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
    } as User)
      .pipe(take(1))
      .subscribe((user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
        this.loading.set(false);
      });
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(''); // Réinitialiser les erreurs
    const userId = 1; // TODO: À remplacer par l'ID de l'utilisateur connecté

    this._orderService.getCurrentOrders(userId).subscribe({
      next: (orders: Order[]) => {
        this.currentOrders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error loading current orders');
        this.loading.set(false);
      },
    });

    this._orderService.getOrderHistory(userId).subscribe({
      next: (orders: Order[]) => {
        this.orderHistory.set(orders);
      },
      error: () => {
        this.error.set('Error loading order history');
        this.loading.set(false);
      },
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.loading.set(true);
      const updatedUser: User = {
        ...this.currentUser,
        ...this.profileForm.value,
      };

      this._userService.updateUser(updatedUser).subscribe({
        next: () => {
          this.success.set('Profile updated successfully');
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error updating profile');
          this.loading.set(false);
        },
      });
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      this.loading.set(true);
      const { currentPassword, newPassword } = this.passwordForm.value;
      this._userService.updatePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.success.set('Password updated successfully');
          this.passwordForm.reset();
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error updating password');
          this.loading.set(false);
        },
      });
    }
  }

  onTabChange(tab: 'profile' | 'orders') {
    this.activeTab.set(tab);
    if (tab === 'orders') {
      this.loadOrders();
    }
  }
}
