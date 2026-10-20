import { HttpResponse, delay, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { shouldRetryQuery } from '../src/app/queryClient';
import { ApiRequestError } from '../src/shared/api/apiError';
import { createHttpClient } from '../src/shared/api/http';
import { toFieldPath } from '../src/shared/forms/applyValidationProblem';
import { API, server } from './server';

const schema = z.object({ ok: z.boolean() });

async function captureError(promise: Promise<unknown>): Promise<ApiRequestError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiRequestError) return error;
    throw error;
  }
  throw new Error('Expected the request to fail');
}

describe('HTTP client contract handling', () => {
  const client = createHttpClient({ baseUrl: API, defaultTimeoutMs: 1_000 });

  it('treats a 200 HTML page (SSO login, proxy page) as an unexpected response, not data', async () => {
    server.use(http.get(`${API}/x`, () => HttpResponse.html('<html>login</html>')));
    const error = await captureError(client('/x', { schema }));
    expect(error.error).toMatchObject({ kind: 'unexpected-response', status: 200 });
  });

  it('reports schema drift as a contract violation', async () => {
    server.use(http.get(`${API}/x`, () => HttpResponse.json({ ok: 'yes' })));
    const error = await captureError(client('/x', { schema }));
    expect(error.error.kind).toBe('contract-violation');
  });

  it('distinguishes our timeout from the caller aborting', async () => {
    server.use(http.get(`${API}/slow`, async () => {
      await delay(300);
      return HttpResponse.json({ ok: true });
    }));
    const timedOut = await captureError(client('/slow', { schema, timeoutMs: 30 }));
    expect(timedOut.error.kind).toBe('timeout');

    const controller = new AbortController();
    const pending = client('/slow', { schema, signal: controller.signal });
    controller.abort();
    expect((await captureError(pending)).error.kind).toBe('aborted');
  });

  it('marks a lost write response as an unknown outcome, but not a lost read', async () => {
    server.use(http.post(`${API}/w`, () => HttpResponse.error()), http.get(`${API}/w`, () => HttpResponse.error()));
    expect((await captureError(client('/w', { method: 'POST', schema }))).outcomeUnknown).toBe(true);
    expect((await captureError(client('/w', { schema }))).outcomeUnknown).toBe(false);
  });

  it('calls onUnauthenticated once on 401 and does not retry or refresh in a loop', async () => {
    const onUnauthenticated = vi.fn();
    let calls = 0;
    server.use(http.get(`${API}/me`, () => {
      calls += 1;
      return new HttpResponse(null, { status: 401 });
    }));
    const authClient = createHttpClient({ baseUrl: API, defaultTimeoutMs: 1_000, onUnauthenticated });
    const error = await captureError(authClient('/me', { schema }));
    expect(error.error.kind).toBe('unauthenticated');
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    expect(calls).toBe(1);
  });

  it('sends the CSRF header on writes only', async () => {
    const seen: (string | null)[] = [];
    server.use(
      http.all(`${API}/c`, ({ request }) => {
        seen.push(request.headers.get('X-CSRF-TOKEN'));
        return HttpResponse.json({ ok: true });
      }),
    );
    const csrfClient = createHttpClient({ baseUrl: API, defaultTimeoutMs: 1_000, getCsrfToken: () => 'token-1' });
    await csrfClient('/c', { schema });
    await csrfClient('/c', { method: 'POST', schema, body: {} });
    expect(seen).toEqual([null, 'token-1']);
  });
});

describe('Query retry policy', () => {
  const err = (kind: 'not-found' | 'network' | 'validation') =>
    new ApiRequestError(
      kind === 'network'
        ? { kind: 'network' }
        : kind === 'not-found'
          ? { kind: 'not-found', status: 404, problem: null }
          : { kind: 'validation', status: 400, problem: {}, fieldErrors: {} },
      'GET',
    );

  it('retries transient failures a bounded number of times and never retries 4xx', () => {
    expect(shouldRetryQuery(0, err('network'))).toBe(true);
    expect(shouldRetryQuery(2, err('network'))).toBe(false);
    expect(shouldRetryQuery(0, err('not-found'))).toBe(false);
    expect(shouldRetryQuery(0, err('validation'))).toBe(false);
  });
});

describe('ASP.NET Core validation key mapping', () => {
  it.each([
    ['Title', 'title'],
    ['Items[1].UnitPrice', 'items.1.unitPrice'],
    ['$.items[0].quantity', 'items.0.quantity'],
    ['$', ''],
    ['', ''],
  ])('%s -> %s', (serverKey, path) => {
    expect(toFieldPath(serverKey)).toBe(path);
  });
});
