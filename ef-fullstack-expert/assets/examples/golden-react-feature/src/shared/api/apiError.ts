import type { ProblemDetails } from './problem';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Every failure the UI must treat differently gets its own variant. `switch (error.kind)` with an
 * exhaustive `never` check forces new variants to be handled everywhere they matter.
 */
export type ApiError =
  | { kind: 'validation'; status: 400 | 422; problem: ProblemDetails; fieldErrors: Record<string, string[]> }
  | { kind: 'unauthenticated'; status: 401 }
  | { kind: 'forbidden'; status: 403; problem: ProblemDetails | null }
  | { kind: 'not-found'; status: 404; problem: ProblemDetails | null }
  | { kind: 'conflict'; status: 409; problem: ProblemDetails | null }
  | { kind: 'precondition-failed'; status: 412; problem: ProblemDetails | null }
  | { kind: 'precondition-required'; status: 428; problem: ProblemDetails | null }
  | { kind: 'rate-limited'; status: 429; retryAfterSeconds: number | null }
  | { kind: 'server'; status: number; problem: ProblemDetails | null }
  /** 2xx/4xx/5xx that is not the JSON contract: SSO login page, proxy 404 page, CDN error page. */
  | { kind: 'unexpected-response'; status: number; contentType: string | null }
  /** JSON arrived but does not match the runtime schema: a contract drift, never shown as "no data". */
  | { kind: 'contract-violation'; status: number; issues: string[] }
  | { kind: 'network' }
  | { kind: 'timeout' }
  | { kind: 'aborted' };

const SAFE_METHODS: ReadonlySet<HttpMethod> = new Set(['GET']);
const GATEWAY_STATUSES: ReadonlySet<number> = new Set([502, 503, 504]);

export class ApiRequestError extends Error {
  readonly error: ApiError;
  readonly method: HttpMethod;

  constructor(error: ApiError, method: HttpMethod) {
    super(`API ${method} failed: ${error.kind}`);
    this.name = 'ApiRequestError';
    this.error = error;
    this.method = method;
  }

  /**
   * For a write, losing the response does not prove the server did nothing. The UI must re-read
   * state (or rely on an idempotency key) instead of claiming failure or re-sending blindly.
   */
  get outcomeUnknown(): boolean {
    if (SAFE_METHODS.has(this.method)) return false;
    const e = this.error;
    return e.kind === 'network' || e.kind === 'timeout' || (e.kind === 'server' && GATEWAY_STATUSES.has(e.status));
  }

  /** traceId shown to users as a support reference; never the stack or raw server message. */
  get traceId(): string | undefined {
    const e = this.error;
    return 'problem' in e && e.problem ? e.problem.traceId : undefined;
  }
}

export const isApiRequestError = (value: unknown): value is ApiRequestError => value instanceof ApiRequestError;

export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
