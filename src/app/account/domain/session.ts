import type { User } from './user';

export interface Session {
  readonly user: User;
  readonly token: string;
}
