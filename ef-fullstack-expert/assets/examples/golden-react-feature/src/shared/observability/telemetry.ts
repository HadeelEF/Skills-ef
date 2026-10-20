import { isApiRequestError } from '../api/apiError';

export type ErrorReport = {
  error: unknown;
  /** Where it surfaced: "route:request-details", "mutation:approve", "global:unhandledrejection". */
  source: string;
  traceId?: string;
};

export type TelemetrySink = (report: ErrorReport) => void;

let sink: TelemetrySink = () => {};

/** Wire the real sink (OpenTelemetry web, Sentry, App Insights...) once at startup. */
export function configureTelemetry(next: TelemetrySink): void {
  sink = next;
}

export function reportError(error: unknown, source: string): void {
  // Expected outcomes (validation, 404, 412, user abort) are product states, not incidents.
  if (isApiRequestError(error)) {
    const kind = error.error.kind;
    if (kind === 'validation' || kind === 'not-found' || kind === 'precondition-failed' || kind === 'aborted') return;
    const traceId = error.traceId;
    sink(traceId === undefined ? { error, source } : { error, source, traceId });
    return;
  }
  sink({ error, source });
}

/** Errors outside React render (event handlers, timers, promises) never reach an Error Boundary. */
export function installGlobalErrorHandlers(target: Window): () => void {
  const onError = (event: ErrorEvent) => reportError(event.error ?? event.message, 'global:error');
  const onRejection = (event: PromiseRejectionEvent) => reportError(event.reason, 'global:unhandledrejection');
  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);
  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
  };
}
