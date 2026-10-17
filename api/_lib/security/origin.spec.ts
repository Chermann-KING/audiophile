import { describe, expect, it } from 'vitest';

import { isSameOrigin } from './origin';

const HOST = 'audiophile-one-mu.vercel.app';

describe('isSameOrigin', () => {
  it('accepte une requête dont l’origine est l’hôte de l’API en https', () => {
    expect(isSameOrigin({ origin: `https://${HOST}`, host: HOST })).toBe(true);
  });

  it('utilise x-forwarded-host quand il est présent', () => {
    expect(isSameOrigin({ origin: `https://${HOST}`, host: 'interne.local', 'x-forwarded-host': HOST })).toBe(true);
  });

  it('refuse une autre origine', () => {
    expect(isSameOrigin({ origin: 'https://evil.example', host: HOST })).toBe(false);
  });

  it('refuse un domaine qui contient l’hôte comme préfixe ou suffixe', () => {
    expect(isSameOrigin({ origin: `https://${HOST}.evil.example`, host: HOST })).toBe(false);
    expect(isSameOrigin({ origin: `https://evil-${HOST}`, host: HOST })).toBe(false);
  });

  it('refuse l’absence d’en-tête Origin', () => {
    expect(isSameOrigin({ host: HOST })).toBe(false);
  });

  it('refuse l’origine « null » et les valeurs invalides', () => {
    expect(isSameOrigin({ origin: 'null', host: HOST })).toBe(false);
    expect(isSameOrigin({ origin: 'pas une url', host: HOST })).toBe(false);
  });

  it('refuse http sur un hôte public', () => {
    expect(isSameOrigin({ origin: `http://${HOST}`, host: HOST })).toBe(false);
  });

  it('accepte http uniquement pour localhost (développement)', () => {
    expect(isSameOrigin({ origin: 'http://localhost:3000', host: 'localhost:3000' })).toBe(true);
  });

  it('refuse un port différent', () => {
    expect(isSameOrigin({ origin: 'http://localhost:4200', host: 'localhost:3000' })).toBe(false);
  });
});
