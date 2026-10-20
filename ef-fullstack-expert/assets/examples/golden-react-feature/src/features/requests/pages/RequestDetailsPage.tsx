import { isApiRequestError } from '../../../shared/api/apiError';
import { DISPLAY_LOCALE, formatMoney } from '../../../shared/format/money';
import { ApproveRequestAction } from '../components/ApproveRequestAction';
import { useRequestDetail } from '../hooks/useRequestDetail';
import { requestMessages as m } from '../messages';

export function RequestDetailsPage({ requestId }: { requestId: string }) {
  const query = useRequestDetail(requestId);

  if (query.isPending) {
    return (
      <p role="status" aria-live="polite">
        {m.loading}
      </p>
    );
  }

  // Only a failed *first* load replaces the screen. A failed background refetch keeps the last good
  // data (and any in-progress notice) on screen with a non-blocking warning: v5 reports
  // status 'error' while `data` is still present.
  if (query.data === undefined) {
    const error = query.error;
    if (isApiRequestError(error) && (error.error.kind === 'not-found' || error.error.kind === 'forbidden')) {
      return <p role="alert">{m.notFound}</p>;
    }
    const traceId = isApiRequestError(error) ? error.traceId : undefined;
    return (
      <div role="alert">
        <p>
          {m.loadFailed}
          {traceId !== undefined && (
            <>
              {' '}
              {m.supportReference} <bdi dir="ltr">{traceId}</bdi>
            </>
          )}
        </p>
        <button type="button" onClick={() => void query.refetch()}>
          {m.retry}
        </button>
      </div>
    );
  }

  const { data: request, etag } = query.data;
  return (
    <article aria-labelledby="request-title" aria-busy={query.isFetching}>
      <h1 id="request-title">{request.title}</h1>
      {query.isError && !query.isFetching && <p role="status">{m.refreshFailed}</p>}
      <dl>
        <dt>الحالة</dt>
        <dd>{m.status[request.status]}</dd>
        <dt>المبلغ</dt>
        <dd>
          <bdi>{formatMoney(request.amount, DISPLAY_LOCALE.ar)}</bdi>
        </dd>
        <dt>الإدارة</dt>
        <dd>{request.departmentName}</dd>
      </dl>
      {/* Hiding the action is UX only. POST /approval authorizes the resource on the server. */}
      <ApproveRequestAction
        request={request}
        etag={etag}
        dataUpdatedAt={query.dataUpdatedAt}
        isRefreshing={query.isFetching}
        onVerify={() => void query.refetch()}
      />
    </article>
  );
}
