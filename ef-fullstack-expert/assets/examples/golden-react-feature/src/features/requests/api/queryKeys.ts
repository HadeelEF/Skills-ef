import { queryOptions } from '@tanstack/react-query';
import { scopeKey, type SessionScope } from '../../../shared/session/sessionScope';
import type { RequestsApi } from './requestsApi';

/**
 * One key factory per feature. Every key starts with the feature and the session scope so that
 * invalidation is precise and data of another user/tenant can never satisfy a lookup.
 */
export const requestKeys = {
  all: (scope: SessionScope) => ['requests', scopeKey(scope)] as const,
  lists: (scope: SessionScope) => [...requestKeys.all(scope), 'list'] as const,
  details: (scope: SessionScope) => [...requestKeys.all(scope), 'detail'] as const,
  detail: (scope: SessionScope, id: string) => [...requestKeys.details(scope), id] as const,
};

export const requestDetailQuery = (api: RequestsApi, scope: SessionScope, id: string) =>
  queryOptions({
    queryKey: requestKeys.detail(scope, id),
    queryFn: ({ signal }) => api.getById(id, signal),
    staleTime: 15_000, // approvals change state often; shorter than the app default
  });
