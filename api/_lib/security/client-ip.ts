import { isIP, isIPv6 } from 'node:net';

type HeaderValue = string | string[] | undefined;

// Accepte directement les en-têtes d'une requête Node (clés en minuscules).
export type ForwardedHeaders = Readonly<Record<string, HeaderValue>>;

const UNKNOWN = 'unknown';
const IPV6_PREFIX_GROUPS = 4; // préfixe /64

const first = (value: HeaderValue): string | undefined => (Array.isArray(value) ? value[0] : value);

// Sur Vercel, x-forwarded-for est posé par la plateforme (le client ne peut pas le falsifier).
// Hors Vercel, cette valeur ne serait pas fiable : voir docs/auth-threat-model.md.
export function clientIp(headers: ForwardedHeaders): string {
  const candidate = first(headers['x-forwarded-for'])?.split(',')[0]?.trim() || first(headers['x-real-ip'])?.trim();
  if (!candidate || isIP(candidate) === 0) return UNKNOWN;
  return isIPv6(candidate) ? ipv6Prefix(candidate) : candidate;
}

// Agrège par /64 : un attaquant IPv6 contrôle un /64 entier, qu'il suffirait sinon de parcourir pour contourner la limite.
function ipv6Prefix(address: string): string {
  const [head = '', tail = ''] = address.split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail ? tail.split(':') : [];
  const missing = address.includes('::') ? 8 - headGroups.length - tailGroups.length : 0;
  const groups = [...headGroups, ...Array<string>(missing).fill('0'), ...tailGroups];
  const prefix = groups.slice(0, IPV6_PREFIX_GROUPS).map((group) => group.replace(/^0+(?=.)/, '').toLowerCase());
  return `${prefix.join(':')}::/64`;
}
