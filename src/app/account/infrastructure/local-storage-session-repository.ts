import { Injectable } from '@angular/core';

import type { Session } from '../domain/session';
import { SessionRepository } from '../domain/session-repository';
import { createUser, type User } from '../domain/user';
import { userDtoSchema } from './user.dto';

// Clés historiques, conservées pour ne pas déconnecter les utilisateurs existants.
const USER_KEY = 'currentUser';
const TOKEN_KEY = 'token';

@Injectable()
export class LocalStorageSessionRepository extends SessionRepository {
  load(): Session | null {
    const user = this.readUser();
    return user ? { user, token: localStorage.getItem(TOKEN_KEY) ?? '' } : null;
  }

  save(session: Session): void {
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    localStorage.setItem(TOKEN_KEY, session.token);
  }

  clear(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  // Un contenu absent ou illisible équivaut à « pas de session » : il ne doit jamais bloquer l'interface.
  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (raw === null) return null;

    try {
      const parsed = userDtoSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) return null;
      const created = createUser(parsed.data);
      return created.ok ? created.value : null;
    } catch {
      return null;
    }
  }
}
