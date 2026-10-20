import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { RealtimeConnection } from '../../../shared/realtime/realtimeConnection';
import type { SessionScope } from '../../../shared/session/sessionScope';
import { requestChangedEventSchema } from '../api/contracts';
import { requestKeys } from '../api/queryKeys';
import type { Versioned } from '../api/requestsApi';
import type { PurchaseRequest } from '../api/contracts';

/**
 * Realtime events only say "something changed"; the API stays the source of truth.
 * - Same version as the cache (our own write, or a duplicate delivery): ignore.
 * - Different version: invalidate so active screens re-read; inactive ones refetch when used.
 * - After reconnect: events sent while offline are lost, so resync everything in this scope.
 */
export function useRequestRealtime(connection: RealtimeConnection, scope: SessionScope): void {
  const queryClient = useQueryClient();
  // Depend on primitive values, not the object identity of `scope` (a new object each render).
  const { userId, tenantId } = scope;

  useEffect(() => {
    const current: SessionScope = { userId, tenantId };
    const offChanged = connection.on('RequestChanged', (payload) => {
      const event = requestChangedEventSchema.safeParse(payload);
      if (!event.success) return; // malformed event: ignore, never crash the screen
      const detailKey = requestKeys.detail(current, event.data.requestId);
      const cached = queryClient.getQueryData<Versioned<PurchaseRequest>>(detailKey);
      if (cached?.etag === event.data.etag) return;
      void queryClient.invalidateQueries({ queryKey: detailKey });
      void queryClient.invalidateQueries({ queryKey: requestKeys.lists(current) });
    });
    const offReconnected = connection.onReconnected(() => {
      void queryClient.invalidateQueries({ queryKey: requestKeys.all(current) });
    });
    return () => {
      offChanged();
      offReconnected();
    };
  }, [connection, userId, tenantId, queryClient]);
}
