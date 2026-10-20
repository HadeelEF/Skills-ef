import { useEffect, useRef, useState } from 'react';
import { assertNever, isApiRequestError } from '../../../shared/api/apiError';
import { reportError } from '../../../shared/observability/telemetry';
import type { PurchaseRequest } from '../api/contracts';
import { useApproveRequest } from '../hooks/useApproveRequest';
import { requestMessages as m } from '../messages';

type Notice =
  | { kind: 'approved' }
  | { kind: 'conflict' }
  | { kind: 'business-rule'; message: string }
  | { kind: 'outcome-unknown'; startedAt: number }
  | { kind: 'rate-limited' }
  | { kind: 'failed'; traceId: string | undefined };

type Props = {
  request: PurchaseRequest;
  etag: string;
  /** When the detail query last received server data; used to confirm an unknown outcome. */
  dataUpdatedAt: number;
  isRefreshing: boolean;
  onVerify: () => void;
};

export function ApproveRequestAction({ request, etag, dataUpdatedAt, isRefreshing, onVerify }: Props) {
  const approve = useApproveRequest(request.id);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const canApprove = request.allowedActions.includes('approve');

  // The approve button may disappear after success: move focus to the result so keyboard and
  // screen-reader users are not dropped on <body>. This syncs with the DOM, a legitimate effect.
  useEffect(() => {
    if (notice !== null) noticeRef.current?.focus();
  }, [notice]);

  const handleApprove = () => {
    if (approve.isPending) return; // second guard against double activation; ETag also protects the server
    const startedAt = Date.now();
    setNotice(null);
    approve.mutate(etag, {
      onSuccess: () => setNotice({ kind: 'approved' }),
      onError: (error) => {
        if (!isApiRequestError(error)) {
          reportError(error, 'mutation:approve-request');
          setNotice({ kind: 'failed', traceId: undefined });
          return;
        }
        if (error.outcomeUnknown) {
          setNotice({ kind: 'outcome-unknown', startedAt });
          return;
        }
        const e = error.error;
        switch (e.kind) {
          case 'precondition-failed':
          case 'precondition-required':
            setNotice({ kind: 'conflict' });
            return;
          case 'conflict': {
            const code = e.problem?.code;
            setNotice({ kind: 'business-rule', message: (code && m.businessRule[code]) || m.businessRuleFallback });
            return;
          }
          case 'rate-limited':
            setNotice({ kind: 'rate-limited' });
            return;
          case 'validation':
          case 'unauthenticated':
          case 'forbidden':
          case 'not-found':
          case 'server':
          case 'unexpected-response':
          case 'contract-violation':
          case 'network':
          case 'timeout':
          case 'aborted':
            reportError(error, 'mutation:approve-request');
            setNotice({ kind: 'failed', traceId: error.traceId });
            return;
          default:
            assertNever(e);
        }
      },
    });
  };

  if (!canApprove && notice === null) return null;

  return (
    <section aria-labelledby="approve-heading">
      <h2 id="approve-heading" className="visually-hidden">
        {m.approve}
      </h2>
      {canApprove && (
        <button type="button" onClick={handleApprove} disabled={approve.isPending}>
          {approve.isPending ? m.approving : m.approve}
        </button>
      )}
      <div ref={noticeRef} tabIndex={-1} role="status" aria-live="polite">
        {notice !== null && (
          <NoticeText
            notice={notice}
            status={request.status}
            dataUpdatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onVerify={onVerify}
          />
        )}
      </div>
    </section>
  );
}

function NoticeText({
  notice,
  status,
  dataUpdatedAt,
  isRefreshing,
  onVerify,
}: {
  notice: Notice;
  status: PurchaseRequest['status'];
  dataUpdatedAt: number;
  isRefreshing: boolean;
  onVerify: () => void;
}) {
  switch (notice.kind) {
    case 'approved':
      return <p>{m.approved}</p>;
    case 'conflict':
      return <p>{m.conflict}</p>;
    case 'business-rule':
      return <p>{notice.message}</p>;
    case 'rate-limited':
      return <p>{m.rateLimited}</p>;
    case 'failed':
      return (
        <p>
          {m.unexpected}
          {notice.traceId !== undefined && (
            <>
              {' '}
              {m.supportReference} <bdi dir="ltr">{notice.traceId}</bdi>
            </>
          )}
        </p>
      );
    case 'outcome-unknown': {
      // Derived, not stored: the answer comes from server data newer than the attempt.
      if (isRefreshing) return <p>{m.outcomeUnknown}</p>;
      if (dataUpdatedAt < notice.startedAt) {
        return (
          <p>
            {m.cannotVerify}{' '}
            <button type="button" onClick={onVerify}>
              {m.verifyAgain}
            </button>
          </p>
        );
      }
      return <p>{status === 'Approved' ? m.outcomeConfirmedApproved : m.outcomeConfirmedNotApproved}</p>;
    }
    default:
      return assertNever(notice);
  }
}
