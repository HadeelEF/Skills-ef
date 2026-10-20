import { HttpResponse, http } from 'msw';
import { API } from './server';

export const REQUEST_ID = '3f2b8c1e-5d4a-4b7e-9c1f-2a6d8e9b0c11';
export const V1 = '"AAAAAAAAB9E="';
export const V2 = '"AAAAAAAAB9I="';

export type RequestRow = {
  id: string;
  title: string;
  amount: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  departmentName: string;
  decidedAt: string | null;
  allowedActions: string[];
  etag: string;
};

/** In-memory stand-in for the server state, so tests can assert the read-back after a write. */
export function createRequestStore(overrides: Partial<RequestRow> = {}) {
  const row: RequestRow = {
    id: REQUEST_ID,
    title: 'شراء أجهزة حاسب للمختبر',
    amount: '12345678901234567.25',
    status: 'Submitted',
    departmentName: 'تقنية المعلومات',
    decidedAt: null,
    allowedActions: ['approve', 'futureAction'],
    etag: V1,
    ...overrides,
  };
  const calls = { get: 0, approve: [] as { ifMatch: string | null }[] };

  const readResponse = () => {
    calls.get += 1;
    const { etag, ...body } = row;
    return HttpResponse.json(body, { headers: { ETag: etag } });
  };
  const getHandler = http.get(`${API}/requests/:id`, readResponse);

  const approveInStore = () => {
    row.status = 'Approved';
    row.decidedAt = '2026-10-05T09:00:00Z';
    row.allowedActions = [];
    row.etag = V2;
  };

  return { row, calls, getHandler, readResponse, approveInStore };
}

export const problem = (status: number, extra: Record<string, unknown> = {}) =>
  HttpResponse.json({ status, title: 'Server title in English', traceId: '00-4bf92f3577b34da6a3ce929d0e0e4736-01', ...extra }, {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
