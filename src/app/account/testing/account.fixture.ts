import type { Session } from '../domain/session';
import type { User } from '../domain/user';

export const aUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  ...overrides,
});

export const aSession = (overrides: Partial<Session> = {}): Session => ({
  user: aUser(),
  token: 'token',
  ...overrides,
});
