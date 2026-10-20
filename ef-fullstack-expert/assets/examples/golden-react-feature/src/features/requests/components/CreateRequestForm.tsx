import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useId, useState, type ReactNode } from 'react';
import { useFieldArray, useForm, type FieldError } from 'react-hook-form';
import { z } from 'zod';
import { isApiRequestError } from '../../../shared/api/apiError';
import { applyValidationProblem } from '../../../shared/forms/applyValidationProblem';
import { reportError } from '../../../shared/observability/telemetry';
import { useSessionScope } from '../../../shared/session/sessionScope';
import type { CreateRequestCommand } from '../api/contracts';
import { requestKeys } from '../api/queryKeys';
import { useRequestsApi } from '../api/requestsApiContext';
import { requestMessages } from '../messages';

const m = requestMessages.form;
const TITLE_MAX = 200; // mirrors PurchaseRequest.TitleMaxLength; the server stays authoritative

/**
 * Draft values stay strings while the user types ("1." or "0" must not be coerced mid-edit);
 * conversion to the command happens once, at submit.
 */
const itemSchema = z.object({
  description: z.string().trim().min(1, m.required),
  quantity: z.string().regex(/^[1-9]\d{0,5}$/, m.quantityPositive),
  unitPrice: z
    .string()
    .trim()
    .regex(/^\d{1,12}(\.\d{1,2})?$/, m.pricePositive)
    .refine((value) => /[1-9]/.test(value), m.pricePositive),
});

const formSchema = z.object({
  title: z.string().trim().min(1, m.required).max(TITLE_MAX, m.titleTooLong),
  items: z.array(itemSchema).min(1, m.atLeastOneItem),
});

type FormValues = z.infer<typeof formSchema>;

const emptyItem = { description: '', quantity: '1', unitPrice: '' };

const toCommand = (values: FormValues): CreateRequestCommand => ({
  title: values.title.trim(),
  items: values.items.map((item) => ({
    description: item.description.trim(),
    quantity: Number(item.quantity),
    unitPrice: item.unitPrice, // decimal stays a string end to end
  })),
});

const RENDERED_FIELD = /^(title|items\.(\d+)\.(description|quantity|unitPrice))$/;

type Props = {
  onCreated: (id: string) => void;
  /** Slot for route-level concerns (unsaved-changes guard) without coupling the form to the router. */
  renderGuard?: (isDirty: boolean) => ReactNode;
};

export function CreateRequestForm({ onCreated, renderGuard }: Props) {
  const api = useRequestsApi();
  const scope = useSessionScope();
  const queryClient = useQueryClient();
  const formId = useId();
  // One key per draft: retries after an unknown outcome are safe; a new draft gets a new key.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [summary, setSummary] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', items: [emptyItem] },
    mode: 'onTouched',
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const create = useMutation({
    mutationFn: (command: CreateRequestCommand) => api.create(command, idempotencyKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.lists(scope) }),
  });

  const onValid = async (values: FormValues) => {
    setSummary([]);
    try {
      const created = await create.mutateAsync(toCommand(values));
      reset(values); // the draft is saved: no longer dirty, no unsaved-changes prompt
      setIdempotencyKey(crypto.randomUUID());
      onCreated(created.id);
    } catch (error) {
      if (isApiRequestError(error) && error.error.kind === 'validation') {
        const { unmatched, firstField } = applyValidationProblem(error.error.fieldErrors, setError, (path) => {
          const match = RENDERED_FIELD.exec(path);
          return match !== null && (match[2] === undefined || Number(match[2]) < fields.length);
        });
        setSummary(unmatched.length > 0 ? [m.summaryTitle, ...unmatched] : []);
        if (firstField !== null) setFocus(firstField as Parameters<typeof setFocus>[0]);
        return;
      }
      if (isApiRequestError(error) && error.outcomeUnknown) {
        setSummary([m.outcomeUnknown]); // input is preserved; same idempotency key on resubmit
        return;
      }
      reportError(error, 'mutation:create-request');
      const traceId = isApiRequestError(error) ? error.traceId : undefined;
      setSummary([
        traceId === undefined ? requestMessages.unexpected : `${requestMessages.unexpected} ${requestMessages.supportReference} ${traceId}`,
      ]);
    }
  };

  const fieldId = (name: string) => `${formId}-${name}`;
  const describedBy = (name: string, error: FieldError | undefined) => (error ? `${fieldId(name)}-error` : undefined);

  return (
    <form noValidate onSubmit={handleSubmit(onValid)} aria-describedby={summary.length > 0 ? `${formId}-summary` : undefined}>
      {renderGuard?.(isDirty)}

      {summary.length > 0 && (
        <div id={`${formId}-summary`} role="alert">
          {summary.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      )}

      <div>
        <label htmlFor={fieldId('title')}>{m.title}</label>
        <input
          id={fieldId('title')}
          maxLength={TITLE_MAX}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={describedBy('title', errors.title)}
          {...register('title')}
        />
        {errors.title && <p id={`${fieldId('title')}-error`}>{errors.title.message}</p>}
      </div>

      <fieldset>
        <legend>{m.items}</legend>
        {errors.items?.root && <p role="alert">{errors.items.root.message}</p>}
        {errors.items?.message && <p role="alert">{errors.items.message}</p>}
        {fields.map((field, index) => {
          const itemErrors = errors.items?.[index];
          const n = index + 1;
          return (
            // field.id is stable across add/remove; the array index is not a valid key here.
            <div key={field.id} role="group" aria-label={`${m.items} ${n}`}>
              <label htmlFor={fieldId(`items.${index}.description`)}>
                {m.description} {n}
              </label>
              <input
                id={fieldId(`items.${index}.description`)}
                aria-invalid={itemErrors?.description ? true : undefined}
                aria-describedby={describedBy(`items.${index}.description`, itemErrors?.description)}
                {...register(`items.${index}.description`)}
              />
              {itemErrors?.description && (
                <p id={`${fieldId(`items.${index}.description`)}-error`}>{itemErrors.description.message}</p>
              )}

              <label htmlFor={fieldId(`items.${index}.quantity`)}>
                {m.quantity} {n}
              </label>
              <input
                id={fieldId(`items.${index}.quantity`)}
                inputMode="numeric"
                aria-invalid={itemErrors?.quantity ? true : undefined}
                aria-describedby={describedBy(`items.${index}.quantity`, itemErrors?.quantity)}
                {...register(`items.${index}.quantity`)}
              />
              {itemErrors?.quantity && (
                <p id={`${fieldId(`items.${index}.quantity`)}-error`}>{itemErrors.quantity.message}</p>
              )}

              <label htmlFor={fieldId(`items.${index}.unitPrice`)}>
                {m.unitPrice} {n}
              </label>
              <input
                id={fieldId(`items.${index}.unitPrice`)}
                inputMode="decimal"
                dir="ltr"
                aria-invalid={itemErrors?.unitPrice ? true : undefined}
                aria-describedby={describedBy(`items.${index}.unitPrice`, itemErrors?.unitPrice)}
                {...register(`items.${index}.unitPrice`)}
              />
              {itemErrors?.unitPrice && (
                <p id={`${fieldId(`items.${index}.unitPrice`)}-error`}>{itemErrors.unitPrice.message}</p>
              )}

              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)}>
                  {m.removeItem} {n}
                </button>
              )}
            </div>
          );
        })}
        <button type="button" onClick={() => append(emptyItem)}>
          {m.addItem}
        </button>
      </fieldset>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? m.submitting : m.submit}
      </button>
    </form>
  );
}
