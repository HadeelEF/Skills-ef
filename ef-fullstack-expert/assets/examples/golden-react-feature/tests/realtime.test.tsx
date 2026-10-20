import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { requestKeys } from '../src/features/requests/api/queryKeys';
import { useRequestRealtime } from '../src/features/requests/realtime/useRequestRealtime';
import type { RealtimeConnection } from '../src/shared/realtime/realtimeConnection';
import { REQUEST_ID, V1, V2 } from './fixtures';
import { SCOPE_A, createTestQueryClient } from './renderWithProviders';

function createFakeConnection() {
  const handlers = new Map<string, Set<(payload: unknown) => void>>();
  const reconnected = new Set<() => void>();
  const connection: RealtimeConnection = {
    on(event, handler) {
      const set = handlers.get(event) ?? new Set();
      set.add(handler);
      handlers.set(event, set);
      return () => set.delete(handler);
    },
    onReconnected(handler) {
      reconnected.add(handler);
      return () => reconnected.delete(handler);
    },
  };
  return {
    connection,
    emit: (event: string, payload: unknown) => handlers.get(event)?.forEach((h) => h(payload)),
    reconnect: () => reconnected.forEach((h) => h()),
    listenerCount: () => [...handlers.values()].reduce((n, s) => n + s.size, 0) + reconnected.size,
  };
}

function setup() {
  const queryClient = createTestQueryClient();
  const key = requestKeys.detail(SCOPE_A, REQUEST_ID);
  const fake = createFakeConnection();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useRequestRealtime(fake.connection, SCOPE_A), { wrapper });
  return { queryClient, key, fake, hook };
}

describe('Realtime events update the query cache safely', () => {
  it('ignores an event for the version already cached (own write or duplicate delivery)', () => {
    const { queryClient, key, fake } = setup();
    queryClient.setQueryData(key, { data: {}, etag: V1 });
    fake.emit('RequestChanged', { requestId: REQUEST_ID, etag: V1 });
    expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
  });

  it('invalidates when the server reports a newer version', async () => {
    const { queryClient, key, fake } = setup();
    queryClient.setQueryData(key, { data: {}, etag: V1 });
    fake.emit('RequestChanged', { requestId: REQUEST_ID, etag: V2 });
    await waitFor(() => expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true));
  });

  it('ignores malformed payloads instead of crashing', () => {
    const { queryClient, key, fake } = setup();
    queryClient.setQueryData(key, { data: {}, etag: V1 });
    expect(() => fake.emit('RequestChanged', { requestId: 42 })).not.toThrow();
    expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
  });

  it('resyncs the whole scope after a reconnect (messages sent while offline are lost)', async () => {
    const { queryClient, key, fake } = setup();
    queryClient.setQueryData(key, { data: {}, etag: V1 });
    fake.reconnect();
    await waitFor(() => expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true));
  });

  it('removes its listeners on unmount', () => {
    const { fake, hook } = setup();
    expect(fake.listenerCount()).toBe(2);
    hook.unmount();
    expect(fake.listenerCount()).toBe(0);
  });
});
