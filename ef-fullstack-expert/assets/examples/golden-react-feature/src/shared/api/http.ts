import type { ZodType } from 'zod';
import { ApiRequestError, type ApiError, type HttpMethod } from './apiError';
import { parseProblem } from './problem';

export type HttpClientConfig = {
  /** Same-origin BFF path (e.g. "/api"); cookies carry the session, tokens never reach JS. */
  baseUrl: string;
  defaultTimeoutMs: number;
  /** Antiforgery token for cookie-authenticated writes (ASP.NET Core antiforgery / BFF header). */
  getCsrfToken?: () => string | null;
  /** Called once per 401 so the app can start re-authentication; the client never loops refreshes. */
  onUnauthenticated?: () => void;
};

export type RequestOptions<T> = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Runtime schema for the success body. Use `null` for 204/empty responses. */
  schema: ZodType<T> | null;
};

export type HttpResult<T> = { data: T; etag: string | null };

const JSON_TYPES = ['application/json', 'application/problem+json'];
const isJson = (contentType: string | null) =>
  contentType !== null && JSON_TYPES.some((t) => contentType.toLowerCase().startsWith(t));

export type HttpClient = <T>(path: string, options: RequestOptions<T>) => Promise<HttpResult<T>>;

export function createHttpClient(config: HttpClientConfig): HttpClient {
  return async function request<T>(path: string, options: RequestOptions<T>): Promise<HttpResult<T>> {
    const method = options.method ?? 'GET';
    const fail = (error: ApiError): never => {
      throw new ApiRequestError(error, method);
    };

    const timeout = AbortSignal.timeout(options.timeoutMs ?? config.defaultTimeoutMs);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;

    const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (method !== 'GET') {
      const csrf = config.getCsrfToken?.();
      if (csrf) headers['X-CSRF-TOKEN'] = csrf;
    }

    let response: Response;
    try {
      response = await fetch(`${config.baseUrl}${path}`, {
        method,
        headers,
        credentials: 'same-origin',
        signal,
        ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      });
    } catch (cause) {
      // Distinguish the caller's abort (not an error for the user) from our timeout and the network.
      if (options.signal?.aborted) return fail({ kind: 'aborted' });
      if (timeout.aborted) return fail({ kind: 'timeout' });
      void cause;
      return fail({ kind: 'network' });
    }

    const contentType = response.headers.get('Content-Type');
    const readJson = async (): Promise<unknown> => (isJson(contentType) ? response.json() : undefined);

    if (response.ok) {
      if (options.schema === null || response.status === 204) {
        return { data: undefined as T, etag: response.headers.get('ETag') };
      }
      // fetch resolves on any status: a 200 HTML login page must not be treated as data.
      if (!isJson(contentType)) return fail({ kind: 'unexpected-response', status: response.status, contentType });
      const parsed = options.schema.safeParse(await response.json());
      if (!parsed.success) {
        return fail({
          kind: 'contract-violation',
          status: response.status,
          issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        });
      }
      return { data: parsed.data, etag: response.headers.get('ETag') };
    }

    if (response.status === 401) {
      config.onUnauthenticated?.();
      return fail({ kind: 'unauthenticated', status: 401 });
    }

    const body = await readJson().catch(() => undefined);
    const problem = parseProblem(body);
    if (problem === null && !isJson(contentType) && response.status < 500) {
      return fail({ kind: 'unexpected-response', status: response.status, contentType });
    }

    switch (response.status) {
      case 400:
      case 422:
        return fail({
          kind: 'validation',
          status: response.status === 422 ? 422 : 400,
          problem: problem ?? {},
          fieldErrors: problem?.errors ?? {},
        });
      case 403:
        return fail({ kind: 'forbidden', status: 403, problem });
      case 404:
        return fail({ kind: 'not-found', status: 404, problem });
      case 409:
        return fail({ kind: 'conflict', status: 409, problem });
      case 412:
        return fail({ kind: 'precondition-failed', status: 412, problem });
      case 428:
        return fail({ kind: 'precondition-required', status: 428, problem });
      case 429: {
        const header = response.headers.get('Retry-After');
        const seconds = header === null ? Number.NaN : Number(header); // HTTP-date form is treated as unknown
        return fail({ kind: 'rate-limited', status: 429, retryAfterSeconds: Number.isFinite(seconds) ? seconds : null });
      }
      default:
        return fail({ kind: 'server', status: response.status, problem });
    }
  };
}
