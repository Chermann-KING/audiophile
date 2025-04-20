import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { OrderService } from '../../../../core/services/order.service';
import { User } from '../../../../core/models/user.model';
import { Order } from '../../../../core/models/order.model';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  activeTab: 'profile' | 'orders' = 'profile';
  currentOrders: Order[] = [];
  orderHistory: Order[] = [];
  loading = false;
  error = '';
  success = '';
  currentUser: User | null = null;

  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
    private _orderService: OrderService
  ) {
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
    this.loading = true;
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
        this.loading = false;
      });
  }

  loadOrders(): void {
    this.loading = true;
    this.error = ''; // Réinitialiser les erreurs
    const userId = 1; // TODO: À remplacer par l'ID de l'utilisateur connecté

    this._orderService.getCurrentOrders(userId).subscribe({
      next: (orders: Order[]) => {
        this.currentOrders = orders;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = 'Error loading current orders';
        this.loading = false;
      },
    });

    this._orderService.getOrderHistory(userId).subscribe({
      next: (orders: Order[]) => {
        this.orderHistory = orders;
      },
      error: (err: Error) => {
        this.error = 'Error loading order history';
        this.loading = false;
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
      this.loading = true;
      const updatedUser: User = {
        ...this.currentUser,
        ...this.profileForm.value,
      };

      this._userService.updateUser(updatedUser).subscribe({
        next: () => {
          this.success = 'Profile updated successfully';
          this.loading = false;
        },
        error: (err: Error) => {
          this.error = 'Error updating profile';
          this.loading = false;
        },
      });
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      const { currentPassword, newPassword } = this.passwordForm.value;
      this._userService.updatePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.success = 'Password updated successfully';
          this.passwordForm.reset();
          this.loading = false;
        },
        error: (err: Error) => {
          this.error = 'Error updating password';
          this.loading = false;
        },
      });
    }
  }

  onTabChange(tab: 'profile' | 'orders') {
    this.activeTab = tab;
    if (tab === 'orders') {
      this.loadOrders();
    }
  }
}
