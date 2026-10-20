import { useQuery } from '@tanstack/react-query';
import { useSessionScope } from '../../../shared/session/sessionScope';
import { requestDetailQuery } from '../api/queryKeys';
import { useRequestsApi } from '../api/requestsApiContext';

export function useRequestDetail(id: string) {
  const api = useRequestsApi();
  const scope = useSessionScope();
  return useQuery(requestDetailQuery(api, scope, id));
}
