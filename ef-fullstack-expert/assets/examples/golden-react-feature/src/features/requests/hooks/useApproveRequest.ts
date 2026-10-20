import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionScope } from '../../../shared/session/sessionScope';
import { requestDetailQuery, requestKeys } from '../api/queryKeys';
import { useRequestsApi } from '../api/requestsApiContext';

/**
 * Pessimistic on purpose: approval is a business decision guarded by ETag and server rules, so the
 * UI shows the result the server confirmed instead of an optimistic guess it may have to roll back.
 */
export function useApproveRequest(id: string) {
  const api = useRequestsApi();
  const scope = useSessionScope();
  const queryClient = useQueryClient();
  const detail = requestDetailQuery(api, scope, id);

  return useMutation({
    mutationKey: [...detail.queryKey, 'approve'],
    mutationFn: (etag: string) => api.approve(id, etag),
    onSuccess: (result) => {
      // Typed key (queryOptions) => typed updater. Apply the confirmed result and its new version now…
      queryClient.setQueryData(detail.queryKey, (old) =>
        old === undefined
          ? old
          : {
              etag: result.etag,
              data: {
                ...old.data,
                status: result.data.status,
                decidedAt: result.data.decidedAt,
                allowedActions: old.data.allowedActions.filter((action) => action !== 'approve'),
              },
            },
      );
    },
    // …then re-read the truth (permissions, other fields) after success, conflict or unknown outcome.
    // Returning the promise keeps the mutation pending until the re-read settles.
    onSettled: () => queryClient.invalidateQueries({ queryKey: requestKeys.all(scope) }),
  });
}
