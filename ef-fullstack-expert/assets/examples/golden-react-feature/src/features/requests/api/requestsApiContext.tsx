import { createContext, useContext, type ReactNode } from 'react';
import type { RequestsApi } from './requestsApi';

/** Dependency injection by context: the app wires the real client, tests may wire another. */
const RequestsApiContext = createContext<RequestsApi | null>(null);

export function RequestsApiProvider({ api, children }: { api: RequestsApi; children: ReactNode }) {
  return <RequestsApiContext.Provider value={api}>{children}</RequestsApiContext.Provider>;
}

export function useRequestsApi(): RequestsApi {
  const api = useContext(RequestsApiContext);
  if (api === null) throw new Error('useRequestsApi must be used inside <RequestsApiProvider>.');
  return api;
}
