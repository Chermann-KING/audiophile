import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ListOrders } from '../../../checkout/application/list-orders.use-case';
import type { Order } from '../../../checkout/domain/order';
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
  private readonly listOrders = inject(ListOrders);

  readonly profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    currentPassword: [''],
    newPassword: [''],
    confirmPassword: [''],
  });
  readonly activeTab = signal<'profile' | 'orders'>('profile');
  readonly currentOrders = signal<readonly Order[]>([]);
  readonly orderHistory = signal<readonly Order[]>([]);
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
      void this.loadOrders();
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

  private async loadOrders(): Promise<void> {
    const user = this.account.user();
    if (!user) return;

    this.loading.set(true);
    this.error.set('');

    const [current, history] = await Promise.all([
      this.listOrders.execute(user.id, 'pending'),
      this.listOrders.execute(user.id, 'completed'),
    ]);

    if (current.ok) this.currentOrders.set(current.value);
    if (history.ok) this.orderHistory.set(history.value);
    if (!current.ok) return this.fail('Error loading current orders');
    if (!history.ok) return this.fail('Error loading order history');
    this.loading.set(false);
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
