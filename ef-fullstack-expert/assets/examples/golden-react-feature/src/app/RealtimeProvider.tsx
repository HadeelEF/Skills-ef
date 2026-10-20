import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { RealtimeManager } from '../shared/realtime/realtimeConnection';

const RealtimeContext = createContext<RealtimeManager | null>(null);

/** Holds the connection open while the authenticated shell is mounted (ref-counted, StrictMode-safe). */
export function RealtimeProvider({ manager, children }: { manager: RealtimeManager; children: ReactNode }) {
  useEffect(() => {
    manager.acquire();
    return () => manager.release();
  }, [manager]);
  return <RealtimeContext.Provider value={manager}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeManager {
  const manager = useContext(RealtimeContext);
  if (manager === null) throw new Error('useRealtime must be used inside <RealtimeProvider>.');
  return manager;
}
