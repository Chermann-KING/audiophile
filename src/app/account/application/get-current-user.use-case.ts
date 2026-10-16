import { Injectable, inject } from '@angular/core';

import { SessionRepository } from '../domain/session-repository';
import type { User } from '../domain/user';

@Injectable()
export class GetCurrentUser {
  private readonly sessions = inject(SessionRepository);

  execute(): User | null {
    return this.sessions.load()?.user ?? null;
  }
}
