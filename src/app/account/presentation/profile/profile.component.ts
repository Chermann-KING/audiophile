import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { AccountStore } from '../account.store';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly account = inject(AccountStore);
  private readonly orderService = inject(OrderService);

  readonly profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    currentPassword: [''],
    newPassword: [''],
    confirmPassword: [''],
  });
  readonly activeTab = signal<'profile' | 'orders'>('profile');
  readonly currentOrders = signal<Order[]>([]);
  readonly orderHistory = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  ngOnInit(): void {
    const user = this.account.user();
    if (user) {
      this.profileForm.patchValue({ email: user.email, firstName: user.firstName, lastName: user.lastName });
    }
  }

  onTabChange(tab: 'profile' | 'orders'): void {
    this.activeTab.set(tab);
    if (tab === 'orders') {
      this.loadOrders();
    }
  }

  async onSubmit(): Promise<void> {
    const user = this.account.user();
    if (!this.profileForm.valid || !user) return;

    this.loading.set(true);
    const { firstName, lastName, email, currentPassword, newPassword, confirmPassword } =
      this.profileForm.getRawValue();

    const updated = await this.account.updateProfile({
      ...user,
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      email: email ?? '',
    });
    if (!updated.ok) {
      this.fail('Error updating profile');
      return;
    }

    if (currentPassword || newPassword || confirmPassword) {
      const changed = await this.account.changePassword({
        current: currentPassword ?? '',
        next: newPassword ?? '',
        confirmation: confirmPassword ?? '',
      });
      if (!changed.ok) {
        this.fail('Error updating password');
        return;
      }
      this.profileForm.patchValue({ currentPassword: '', newPassword: '', confirmPassword: '' });
      this.succeed('Password updated successfully');
      return;
    }
    this.succeed('Profile updated successfully');
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.error.set('');
    const userId = 1; // TODO: remplacer par l'identifiant de l'utilisateur connecté (tranche « checkout »).

    this.orderService.getCurrentOrders(userId).subscribe({
      next: (orders) => {
        this.currentOrders.set(orders);
        this.loading.set(false);
      },
      error: () => this.fail('Error loading current orders'),
    });

    this.orderService.getOrderHistory(userId).subscribe({
      next: (orders) => this.orderHistory.set(orders),
      error: () => this.fail('Error loading order history'),
    });
  }

  private succeed(message: string): void {
    this.success.set(message);
    this.loading.set(false);
  }

  private fail(message: string): void {
    this.error.set(message);
    this.loading.set(false);
  }
}
