import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { z } from 'zod';
import { createRequestsApi, RequestsApiProvider, useRequestRealtime } from '../features/requests';
import { createHttpClient } from '../shared/api/http';
import { installGlobalErrorHandlers } from '../shared/observability/telemetry';
import { createSignalRManager } from '../shared/realtime/realtimeConnection';
import { SessionBoundary, useSessionScope, type SessionScope } from '../shared/session/sessionScope';
import { createAppQueryClient } from './queryClient';
import { RealtimeProvider, useRealtime } from './RealtimeProvider';
import { createAppRouter } from './router';

const sessionSchema = z.object({ userId: z.string().min(1), tenantId: z.string().min(1) });

/** BFF: the session lives in an HttpOnly cookie; the SPA only learns who it is, never a token. */
const readCookie = (name: string) =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null;

const http = createHttpClient({
  baseUrl: '/api',
  defaultTimeoutMs: 15_000,
  getCsrfToken: () => readCookie('XSRF-TOKEN'),
  onUnauthenticated: () => {
    const returnUrl = `${window.location.pathname}${window.location.search}`;
    // Same-origin relative path only; the BFF validates it again (open-redirect protection).
    window.location.assign(`/bff/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  },
});
const queryClient = createAppQueryClient();
const requestsApi = createRequestsApi(http);
const router = createAppRouter();

function RealtimeSubscriptions({ children }: { children: ReactNode }) {
  useRequestRealtime(useRealtime(), useSessionScope());
  return <>{children}</>;
}

/**
 * Rendered inside SessionBoundary's keyed subtree, so a new session scope remounts it and gets a new
 * connection (and new server-side group membership). Creating it lazily in state avoids an effect.
 */
function ScopedRealtime({ children }: { children: ReactNode }) {
  const [manager] = useState(() => createSignalRManager('/hubs/requests', { withCredentials: true }));
  return (
    <RealtimeProvider manager={manager}>
      <RealtimeSubscriptions>{children}</RealtimeSubscriptions>
    </RealtimeProvider>
  );
}

function AuthenticatedApp({ scope }: { scope: SessionScope }) {
  return (
    <SessionBoundary scope={scope}>
      <ScopedRealtime>
        <RouterProvider router={router} />
      </ScopedRealtime>
    </SessionBoundary>
  );
}

async function bootstrap() {
  installGlobalErrorHandlers(window);
  const { data: scope } = await http('/session', { schema: sessionSchema });
  const container = document.getElementById('root');
  if (container === null) throw new Error('#root not found');

  createRoot(container).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RequestsApiProvider api={requestsApi}>
          <AuthenticatedApp scope={scope} />
        </RequestsApiProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
