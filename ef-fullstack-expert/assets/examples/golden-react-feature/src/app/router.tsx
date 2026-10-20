import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, useParams } from 'react-router';
import { AppLayout } from './AppLayout';
import { RouteErrorBoundary } from './RouteErrorBoundary';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function NotFoundPage() {
  return <p role="alert">الصفحة غير موجودة.</p>;
}

/**
 * Route params are untrusted input: validate before they reach the API or a query key.
 * `key` resets local UI state (notices, drafts) when moving from one request to another.
 */
function RequestDetailsRoute({ Page }: { Page: (props: { requestId: string }) => ReactNode }) {
  const { requestId } = useParams();
  if (requestId === undefined || !GUID.test(requestId)) return <NotFoundPage />;
  return <Page key={requestId} requestId={requestId} />;
}

/**
 * Data-router setup (React Router v8: DOM APIs from "react-router/dom", everything else from
 * "react-router"). Feature pages are lazy route modules so each feature ships its own chunk.
 * Route-level access checks here are UX; every API endpoint authorizes on the server.
 */
export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/',
      Component: AppLayout,
      ErrorBoundary: RouteErrorBoundary,
      children: [
        { index: true, element: <Navigate to="/requests/new" replace /> },
        {
          path: 'requests/new',
          ErrorBoundary: RouteErrorBoundary,
          lazy: async () => {
            const { CreateRequestPage } = await import('../features/requests/pages/CreateRequestPage');
            return { Component: CreateRequestPage };
          },
        },
        {
          path: 'requests/:requestId',
          ErrorBoundary: RouteErrorBoundary,
          lazy: async () => {
            const { RequestDetailsPage } = await import('../features/requests/pages/RequestDetailsPage');
            return { Component: () => <RequestDetailsRoute Page={RequestDetailsPage} /> };
          },
        },
        { path: '*', Component: NotFoundPage },
      ],
    },
  ]);
}
