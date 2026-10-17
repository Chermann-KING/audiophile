import type { VercelRequest, VercelResponse } from '@vercel/node';

// Doublures minimales de requête / réponse Vercel pour tester les gestionnaires sans serveur.

export interface MockResponse {
  readonly res: VercelResponse;
  readonly statusCode: () => number;
  readonly body: () => unknown;
  readonly header: (name: string) => string | string[] | undefined;
  readonly ended: () => boolean;
}

export function mockResponse(): MockResponse {
  let status = 200;
  let payload: unknown;
  let finished = false;
  const headers = new Map<string, string | string[]>();

  const res = {
    status(code: number) {
      status = code;
      return res;
    },
    setHeader(name: string, value: string | string[]) {
      headers.set(name.toLowerCase(), value);
      return res;
    },
    json(body: unknown) {
      payload = body;
      finished = true;
      return res;
    },
    end() {
      finished = true;
      return res;
    },
  } as unknown as VercelResponse;

  return {
    res,
    statusCode: () => status,
    body: () => payload,
    header: (name) => headers.get(name.toLowerCase()),
    ended: () => finished,
  };
}

export interface MockRequestInit {
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
}

export const HOST = 'audiophile-one-mu.vercel.app';

export function mockRequest(init: MockRequestInit = {}): VercelRequest {
  const headers: Record<string, string> = {
    host: HOST,
    origin: `https://${HOST}`,
    'content-type': 'application/json',
    'x-forwarded-for': '203.0.113.1',
    ...Object.fromEntries(Object.entries(init.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])),
  };
  return { method: init.method ?? 'POST', headers, body: init.body, query: {} } as unknown as VercelRequest;
}
