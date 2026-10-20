import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/**
 * Converts ASP.NET Core validation keys to react-hook-form paths.
 *   "Title"                -> "title"          (DataAnnotations / FluentValidation, PascalCase)
 *   "Items[1].UnitPrice"   -> "items.1.unitPrice"
 *   "$.items[1].unitPrice" -> "items.1.unitPrice" (System.Text.Json binding errors)
 *   ""                     -> ""               (model-level error: no field)
 * Verify the keys your API really emits (MVC, Minimal API validation and FluentValidation differ)
 * with a contract test before relying on this mapping.
 */
export function toFieldPath(serverKey: string): string {
  const trimmed = serverKey.replace(/^\$\.?/, '');
  if (trimmed === '') return '';
  return trimmed
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter((segment) => segment.length > 0)
    .map((segment) => (/^\d+$/.test(segment) ? segment : segment.charAt(0).toLowerCase() + segment.slice(1)))
    .join('.');
}

export type ApplyResult = {
  /** Messages that could not be attached to a rendered field; show them in the form summary. */
  unmatched: string[];
  /** First field that received an error, so the caller can move focus there. */
  firstField: string | null;
};

/**
 * Attaches server messages to the fields the user can see. Anything else becomes a summary message
 * instead of being dropped: a server rule the UI does not know about must still be visible.
 */
export function applyValidationProblem<T extends FieldValues>(
  errors: Record<string, string[]>,
  setError: UseFormSetError<T>,
  isRenderedField: (path: string) => boolean,
): ApplyResult {
  const unmatched: string[] = [];
  let firstField: string | null = null;

  for (const [key, messages] of Object.entries(errors)) {
    const path = toFieldPath(key);
    const message = messages.join(' ');
    if (path !== '' && isRenderedField(path)) {
      setError(path as Path<T>, { type: 'server', message });
      firstField ??= path;
    } else {
      unmatched.push(message);
    }
  }
  return { unmatched, firstField };
}
