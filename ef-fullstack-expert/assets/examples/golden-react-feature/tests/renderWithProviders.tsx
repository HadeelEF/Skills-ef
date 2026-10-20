import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createAppQueryClient } from '../src/app/queryClient';
import { createRequestsApi } from '../src/features/requests/api/requestsApi';
import { RequestsApiProvider } from '../src/features/requests/api/requestsApiContext';
import { createHttpClient } from '../src/shared/api/http';
import { SessionBoundary, type SessionScope } from '../src/shared/session/sessionScope';
import { API } from './server';

export const SCOPE_A: SessionScope = { userId: 'user-a', tenantId: 'dept-1' };
export const SCOPE_B: SessionScope = { userId: 'user-b', tenantId: 'dept-2' };

export function createTestQueryClient(): QueryClient {
  // Real project defaults, minus automatic query retries (covered by unit tests of shouldRetryQuery)
  // so failure paths do not wait for backoff.
  const client = createAppQueryClient();
  client.setDefaultOptions({
    ...client.getDefaultOptions(),
    queries: { ...client.getDefaultOptions().queries, retry: false },
  });
  return client;
}

export function renderWithProviders(ui: ReactNode, options: { scope?: SessionScope; queryClient?: QueryClient } = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const api = createRequestsApi(createHttpClient({ baseUrl: API, defaultTimeoutMs: 2_000 }));
  const wrap = (node: ReactNode, scope: SessionScope) => (
    <QueryClientProvider client={queryClient}>
      <RequestsApiProvider api={api}>
        <SessionBoundary scope={scope}>{node}</SessionBoundary>
      </RequestsApiProvider>
    </QueryClientProvider>
  );
  const result = render(wrap(ui, options.scope ?? SCOPE_A));
  return {
    ...result,
    queryClient,
    rerenderWithScope: (node: ReactNode, scope: SessionScope) => result.rerender(wrap(node, scope)),
  };
}
