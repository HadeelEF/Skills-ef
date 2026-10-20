import { QueryClient } from '@tanstack/react-query';
import { isApiRequestError } from '../shared/api/apiError';

const NON_RETRYABLE = new Set([
  'validation', 'unauthenticated', 'forbidden', 'not-found', 'conflict',
  'precondition-failed', 'precondition-required', 'unexpected-response', 'contract-violation', 'aborted',
]);

/** Retry transient read failures only; a 4xx, a contract drift or a user abort never heals by retrying. */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean =>
  failureCount < 2 && !(isApiRequestError(error) && NON_RETRYABLE.has(error.error.kind));

/**
 * Project defaults, decided once instead of per screen. TanStack Query's library defaults
 * (staleTime 0, refetch on focus, 3 retries for everything) cause request storms on data-heavy
 * internal apps and retry 4xx errors that will never succeed.
 */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true, // with staleTime, only stale queries refetch on focus
        retry: shouldRetryQuery,
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000) + Math.random() * 300,
      },
      mutations: {
        retry: false, // writes are never retried automatically; see ApiRequestError.outcomeUnknown
      },
    },
  });
}
