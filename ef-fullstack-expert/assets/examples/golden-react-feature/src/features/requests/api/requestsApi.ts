import type { HttpClient } from '../../../shared/api/http';
import {
  approveResponseSchema,
  createdRequestSchema,
  purchaseRequestSchema,
  type ApproveResponse,
  type CreateRequestCommand,
  type PurchaseRequest,
} from './contracts';

/** A read always carries the version it was read at; writes send that version back. */
export type Versioned<T> = { data: T; etag: string };

export function createRequestsApi(http: HttpClient) {
  return {
    async getById(id: string, signal?: AbortSignal): Promise<Versioned<PurchaseRequest>> {
      const result = await http(`/requests/${encodeURIComponent(id)}`, {
        schema: purchaseRequestSchema,
        ...(signal ? { signal } : {}),
      });
      if (result.etag === null) throw new Error('Contract: GET /requests/{id} must return an ETag.');
      return { data: result.data, etag: result.etag };
    },

    async approve(id: string, etag: string): Promise<Versioned<ApproveResponse>> {
      const result = await http(`/requests/${encodeURIComponent(id)}/approval`, {
        method: 'POST',
        headers: { 'If-Match': etag },
        schema: approveResponseSchema,
      });
      // Keep the new version: without it the next write would be rejected with 412.
      return { data: result.data, etag: result.etag ?? etag };
    },

    /**
     * The idempotency key belongs to the draft, not to the click: re-sending the same draft after an
     * unknown outcome returns the original result instead of creating a duplicate (server must store it).
     */
    async create(command: CreateRequestCommand, idempotencyKey: string): Promise<{ id: string }> {
      const result = await http('/requests', {
        method: 'POST',
        body: command,
        headers: { 'Idempotency-Key': idempotencyKey },
        schema: createdRequestSchema,
      });
      return result.data;
    },
  };
}

export type RequestsApi = ReturnType<typeof createRequestsApi>;
