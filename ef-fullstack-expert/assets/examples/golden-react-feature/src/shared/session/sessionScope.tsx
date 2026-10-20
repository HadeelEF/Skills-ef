import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';

/**
 * Who the cached data belongs to. It is part of every query key and the key of the subtree that
 * holds drafts, so switching user or tenant can never render or submit the previous scope's data.
 */
export type SessionScope = { userId: string; tenantId: string };

export const scopeKey = (scope: SessionScope): string => `${scope.tenantId}:${scope.userId}`;

const SessionScopeContext = createContext<SessionScope | null>(null);

export function useSessionScope(): SessionScope {
  const scope = useContext(SessionScopeContext);
  if (scope === null) throw new Error('useSessionScope must be used inside <SessionBoundary>.');
  return scope;
}

export function SessionBoundary({ scope, children }: { scope: SessionScope; children: ReactNode }) {
  const queryClient = useQueryClient();
  const key = scopeKey(scope);
  const previous = useRef(key);

  useEffect(() => {
    if (previous.current === key) return;
    const old = previous.current;
    previous.current = key;
    // Cancel in-flight work of the old scope and drop its cache. The render-time `key` below already
    // hides old data in the same commit; this cleanup frees memory and stops late writes into the cache.
    void queryClient.cancelQueries({ predicate: (q) => q.queryKey.includes(old) });
    queryClient.removeQueries({ predicate: (q) => q.queryKey.includes(old) });
  }, [key, queryClient]);

  return (
    <SessionScopeContext.Provider value={scope}>
      {/* Remount on scope change: drafts, optimistic state and local UI state do not survive. */}
      <ScopeSubtree key={key}>{children}</ScopeSubtree>
    </SessionScopeContext.Provider>
  );
}

function ScopeSubtree({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
