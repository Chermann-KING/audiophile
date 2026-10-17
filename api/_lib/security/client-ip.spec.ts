import { describe, expect, it } from 'vitest';

import { clientIp } from './client-ip';

describe('clientIp', () => {
  it('lit la première adresse de x-forwarded-for', () => {
    expect(clientIp({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })).toBe('203.0.113.7');
  });

  it('se rabat sur x-real-ip', () => {
    expect(clientIp({ 'x-real-ip': '198.51.100.4' })).toBe('198.51.100.4');
  });

  it('agrège les adresses IPv6 par préfixe /64', () => {
    const a = clientIp({ 'x-forwarded-for': '2001:db8:1:2:aaaa:bbbb:cccc:dddd' });
    const b = clientIp({ 'x-forwarded-for': '2001:db8:1:2:1111:2222:3333:4444' });
    expect(a).toBe(b);
    expect(a).toBe('2001:db8:1:2::/64');
  });

  it('distingue deux préfixes IPv6 /64 différents', () => {
    expect(clientIp({ 'x-forwarded-for': '2001:db8:1:2::1' })).not.toBe(clientIp({ 'x-forwarded-for': '2001:db8:1:3::1' }));
  });

  it.each([undefined, '', 'pas-une-ip', '999.1.1.1', '<script>'])('renvoie « unknown » pour une valeur invalide (%j)', (value) => {
    expect(clientIp({ 'x-forwarded-for': value })).toBe('unknown');
  });

  it('renvoie « unknown » sans en-tête', () => {
    expect(clientIp({})).toBe('unknown');
  });

  it('accepte une valeur de type tableau (en-tête répété)', () => {
    expect(clientIp({ 'x-forwarded-for': ['203.0.113.9', '10.0.0.1'] })).toBe('203.0.113.9');
  });
});
