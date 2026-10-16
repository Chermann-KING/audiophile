import { Injectable, inject } from '@angular/core';

import { SessionRepository } from '../domain/session-repository';

@Injectable()
export class Logout {
  private readonly sessions = inject(SessionRepository);

  execute(): void {
    this.sessions.clear();
  }
}
