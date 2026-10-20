import type { HubConnection, HubConnectionState } from '@microsoft/signalr';

/**
 * The small surface features depend on. Features never import @microsoft/signalr directly, which
 * keeps them testable with a fake and lets the transport change without touching feature code.
 */
export type RealtimeConnection = {
  on(event: string, handler: (payload: unknown) => void): () => void;
  /** Fired after a reconnect or restart: messages sent while disconnected are lost (at-most-once). */
  onReconnected(handler: () => void): () => void;
};

export type RealtimeManager = RealtimeConnection & {
  acquire(): void;
  release(): void;
};

/**
 * One hub connection per session scope, shared by all features.
 * - The SignalR client (~150 KB unminified) is loaded with a dynamic import on first acquire, so it
 *   stays out of the initial bundle; realtime is an enhancement, the API is the source of truth.
 * - Listeners live in our own registry, so features can subscribe before the connection exists and
 *   unsubscribe at any time. HubConnection.onreconnected/onclose have no removal API at all.
 * - StrictMode mounts, unmounts and remounts effects: stop is deferred so a remount reuses the same
 *   connection instead of racing start() against stop().
 */
export function createSignalRManager(url: string, options: { withCredentials: boolean }): RealtimeManager {
  const listeners = new Map<string, Set<(payload: unknown) => void>>();
  const resyncListeners = new Set<() => void>();
  const notifyResync = () => resyncListeners.forEach((listener) => listener());

  let connection: HubConnection | null = null;
  let disconnected: HubConnectionState | null = null; // enum value read from the lazily loaded module
  let loading: Promise<HubConnection> | null = null;
  let starting: Promise<void> | null = null;
  let users = 0;
  let stopTimer: ReturnType<typeof setTimeout> | undefined;
  let connectedBefore = false;

  const attach = (hub: HubConnection, event: string) =>
    hub.on(event, (payload: unknown) => listeners.get(event)?.forEach((handler) => handler(payload)));

  const load = (): Promise<HubConnection> => {
    loading ??= import('@microsoft/signalr').then((signalR) => {
      const hub = new signalR.HubConnectionBuilder()
        .withUrl(url, { withCredentials: options.withCredentials })
        .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 30_000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();
      hub.onreconnected(notifyResync);
      // After stop() completes or automatic reconnect gives up: restart if still in use.
      hub.onclose(() => {
        if (users > 0) setTimeout(ensureStarted, 1_000);
      });
      listeners.forEach((_, event) => attach(hub, event));
      disconnected = signalR.HubConnectionState.Disconnected;
      connection = hub;
      return hub;
    });
    return loading;
  };

  function ensureStarted(): void {
    if (starting || users === 0) return;
    starting = load()
      .then(async (hub) => {
        if (hub.state !== disconnected) return;
        await hub.start();
        // A fresh start after a closed connection is also a gap in delivery: resync like a reconnect.
        if (connectedBefore) notifyResync();
        connectedBefore = true;
      })
      .catch(() => {
        // Initial start is not covered by withAutomaticReconnect: retry while still in use.
        if (users > 0) setTimeout(ensureStarted, 5_000);
      })
      .finally(() => {
        starting = null;
      });
  }

  return {
    acquire() {
      users += 1;
      if (stopTimer !== undefined) clearTimeout(stopTimer);
      ensureStarted();
    },
    release() {
      users = Math.max(0, users - 1);
      if (users > 0) return;
      stopTimer = setTimeout(() => {
        if (users === 0) void (starting ?? Promise.resolve()).then(() => connection?.stop());
      }, 1_000);
    },
    on(event, handler) {
      let set = listeners.get(event);
      if (set === undefined) {
        set = new Set();
        listeners.set(event, set);
        if (connection !== null) attach(connection, event);
      }
      set.add(handler);
      return () => set.delete(handler);
    },
    onReconnected(handler) {
      resyncListeners.add(handler);
      return () => resyncListeners.delete(handler);
    },
  };
}
