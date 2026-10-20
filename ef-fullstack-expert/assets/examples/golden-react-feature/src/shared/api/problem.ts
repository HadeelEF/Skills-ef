/**
 * RFC 9457 ProblemDetails as produced by ASP.NET Core (AddProblemDetails / ValidationProblemDetails).
 * The shape is parsed from `unknown` by narrowing: a TypeScript type alone never validates JSON.
 */
export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  /** Business error code added by the API as an extension (e.g. "request.self_approval"). */
  code?: string;
  /** ValidationProblemDetails: server key -> messages. Keys follow the server's naming, not the form's. */
  errors?: Record<string, string[]>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

export function parseProblem(value: unknown): ProblemDetails | null {
  if (!isRecord(value)) return null;

  const problem: ProblemDetails = {};
  const type = optionalString(value.type);
  const title = optionalString(value.title);
  const detail = optionalString(value.detail);
  const traceId = optionalString(value.traceId);
  const code = optionalString(value.code);
  if (type !== undefined) problem.type = type;
  if (title !== undefined) problem.title = title;
  if (detail !== undefined) problem.detail = detail;
  if (traceId !== undefined) problem.traceId = traceId;
  if (code !== undefined) problem.code = code;
  if (typeof value.status === 'number') problem.status = value.status;

  if (isRecord(value.errors)) {
    const errors: Record<string, string[]> = {};
    for (const [key, messages] of Object.entries(value.errors)) {
      if (Array.isArray(messages)) {
        const texts = messages.filter((m): m is string => typeof m === 'string');
        if (texts.length > 0) errors[key] = texts;
      }
    }
    problem.errors = errors;
  }
  return problem;
}
