import { describe, expect, it, vi } from 'vitest';

import { createSecurityLogger } from './logger';

const capture = () => {
  const lines: string[] = [];
  const logger = createSecurityLogger((line) => lines.push(line));
  return { lines, logger, parsed: () => lines.map((line) => JSON.parse(line) as Record<string, unknown>) };
};

describe('createSecurityLogger', () => {
  it('journalise une ligne JSON avec l’événement et la date', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-10-17T10:00:00.000Z'));
    const { logger, parsed } = capture();

    logger.event('login_failure', { reason: 'bad_password' });

    expect(parsed()[0]).toMatchObject({ event: 'login_failure', reason: 'bad_password', at: '2026-10-17T10:00:00.000Z' });
    vi.useRealTimers();
  });

  it('remplace l’email par une empreinte courte', () => {
    const { logger, lines } = capture();
    logger.event('login_failure', { email: 'jane@example.com' });

    expect(lines[0]).not.toContain('jane@example.com');
    expect(lines[0]).toMatch(/"emailHash":"[0-9a-f]{12}"/);
  });

  it.each(['password', 'token', 'cookie', 'passwordHash', 'authorization'])('ne journalise jamais le champ « %s »', (field) => {
    const { logger, lines } = capture();
    logger.event('test', { [field]: 'valeur-secrete' });

    expect(lines[0]).not.toContain('valeur-secrete');
  });

  it('neutralise les retours à la ligne pour empêcher l’injection de fausses entrées', () => {
    const { logger, lines } = capture();
    logger.event('test', { reason: 'ligne1\n{"event":"fausse_entree"}' });

    expect(lines).toHaveLength(1);
    expect(lines[0]).not.toContain('\n');
  });
});
