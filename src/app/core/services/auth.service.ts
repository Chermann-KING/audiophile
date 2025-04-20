import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../models/user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.isLoggedInSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const mockUser: User = {
      id: '1',
      email: email,
      firstName: 'John',
      lastName: 'Doe',
    };

    const response: AuthResponse = {
      user: mockUser,
      token: 'mock-jwt-token',
    };

    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('token', response.token);
    this.currentUserSubject.next(mockUser);
    this.isLoggedInSubject.next(true);

    return of(response).pipe(delay(800));
  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Observable<AuthResponse> {
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      firstName,
      lastName,
    };

    const response: AuthResponse = {
      user: mockUser,
      token: 'mock-jwt-token',
    };

    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('token', response.token);
    this.currentUserSubject.next(mockUser);
    this.isLoggedInSubject.next(true);

    return of(response).pipe(delay(800));
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  private generateDemoToken(): string {
    // Générer un token simple pour la démo
    return 'demo-token-' + Math.random().toString(36).substr(2);
  }
}
