import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { isApiRequestError } from '../shared/api/apiError';
import { reportError } from '../shared/observability/telemetry';

/** Route-level boundary: one broken screen keeps the shell, navigation and other routes usable. */
export function RouteErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    if (!isRouteErrorResponse(error)) reportError(error, 'route');
  }, [error]);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <p role="alert">الصفحة غير موجودة.</p>;
  }
  const traceId = isApiRequestError(error) ? error.traceId : undefined;
  return (
    <div role="alert">
      <p>تعذر عرض هذه الصفحة.</p>
      {traceId !== undefined && (
        <p>
          رقم المرجع للدعم الفني: <bdi dir="ltr">{traceId}</bdi>
        </p>
      )}
      <button type="button" onClick={() => window.location.reload()}>
        إعادة تحميل الصفحة
      </button>
    </div>
  );
}
