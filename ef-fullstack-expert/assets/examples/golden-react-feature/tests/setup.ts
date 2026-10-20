import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';

// Unhandled requests fail the test: a test that silently hits an unmocked endpoint proves nothing.
// MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`; only the typecheck caught the old name,
// because the test runner strips types and MSW silently ignored the unknown option.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
