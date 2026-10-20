import { z } from 'zod';
import { toDecimalString } from '../../../shared/format/money';

export const requestStatusSchema = z.enum(['Draft', 'Submitted', 'Approved', 'Rejected']);
export type RequestStatus = z.infer<typeof requestStatusSchema>;

/** Actions the server says the current user may perform on this resource right now. */
export const REQUEST_ACTIONS = ['approve', 'edit'] as const;
export type RequestAction = (typeof REQUEST_ACTIONS)[number];
const isRequestAction = (value: string): value is RequestAction => (REQUEST_ACTIONS as readonly string[]).includes(value);

const decimalSchema = z.union([z.string(), z.number()]).transform((value, ctx) => {
  const decimal = toDecimalString(value);
  if (decimal === null) {
    ctx.addIssue({ code: 'custom', message: 'Invalid decimal amount' });
    return z.NEVER;
  }
  return decimal;
});

export const purchaseRequestSchema = z.object({
  id: z.guid(),
  title: z.string(),
  amount: decimalSchema,
  status: requestStatusSchema,
  departmentName: z.string(),
  decidedAt: z.string().nullable(),
  // Unknown future actions are ignored instead of failing the whole screen (forward compatibility).
  allowedActions: z.array(z.string()).transform((actions) => actions.filter(isRequestAction)),
});
export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;

export const approveResponseSchema = z.object({
  id: z.guid(),
  status: requestStatusSchema,
  decidedAt: z.string(),
});
export type ApproveResponse = z.infer<typeof approveResponseSchema>;

export const createdRequestSchema = z.object({ id: z.guid() });

/** Write contract: only fields the user may set. Never Partial<PurchaseRequest>. */
export type CreateRequestCommand = {
  title: string;
  items: { description: string; quantity: number; unitPrice: string }[];
};

/** Realtime notification: a hint to re-read, never the source of truth. */
export const requestChangedEventSchema = z.object({ requestId: z.guid(), etag: z.string() });
