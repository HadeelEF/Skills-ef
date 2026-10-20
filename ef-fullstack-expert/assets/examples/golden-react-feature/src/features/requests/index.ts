/**
 * Public surface of the requests feature. Other features and the app shell import from here only
 * (enforced by dependency-cruiser). Keep it small: exporting internals turns this barrel into a
 * coupling point and defeats code splitting of the lazy route modules.
 */
export { createRequestsApi, type RequestsApi } from './api/requestsApi';
export { RequestsApiProvider } from './api/requestsApiContext';
export { requestKeys } from './api/queryKeys';
export { useRequestRealtime } from './realtime/useRequestRealtime';
