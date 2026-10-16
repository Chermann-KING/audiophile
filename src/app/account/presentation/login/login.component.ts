import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import type { LoginError } from '../../application/login.use-case';
import { AccountStore } from '../account.store';

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL: "Format d'email invalide",
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 6 caractères',
};

const messageOf = (error: LoginError): string =>
  typeof error === 'string' ? MESSAGES[error] : 'Connexion impossible, veuillez réessayer';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly account = inject(AccountStore);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (!this.loginForm.valid) return;

    this.isLoading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.getRawValue();
    const result = await this.account.signIn({ email: email ?? '', password: password ?? '' });

    if (result.ok) {
      this.router.navigate(['/']);
      return;
    }
    this.error.set(messageOf(result.error));
    this.isLoading.set(false);
  }
}
