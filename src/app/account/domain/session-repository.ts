import type { Session } from './session';

// Port sortant synchrone : la session est un état local lu au démarrage de l'interface.
export abstract class SessionRepository {
  abstract load(): Session | null;
  abstract save(session: Session): void;
  abstract clear(): void;
}
