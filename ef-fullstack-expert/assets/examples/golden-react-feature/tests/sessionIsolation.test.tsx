import { screen } from '@testing-library/react';
import { HttpResponse, delay, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { RequestDetailsPage } from '../src/features/requests/pages/RequestDetailsPage';
import { REQUEST_ID, V1 } from './fixtures';
import { SCOPE_A, SCOPE_B, renderWithProviders } from './renderWithProviders';
import { API, server } from './server';

describe('Session scope isolation', () => {
  it('never renders the previous user’s data after a user/tenant switch, even for the same URL', async () => {
    let caller = 'A';
    server.use(
      http.get(`${API}/requests/:id`, async () => {
        const who = caller;
        if (who === 'B') await delay(100); // B's read is slow: A's cached data must not fill the gap
        return HttpResponse.json(
          {
            id: REQUEST_ID,
            title: who === 'A' ? 'طلب يخص المستخدم أ' : 'طلب يخص المستخدم ب',
            amount: '10',
            status: 'Submitted',
            departmentName: 'x',
            decidedAt: null,
            allowedActions: [],
          },
          { headers: { ETag: V1 } },
        );
      }),
    );

    const view = renderWithProviders(<RequestDetailsPage requestId={REQUEST_ID} />, { scope: SCOPE_A });
    expect(await screen.findByText('طلب يخص المستخدم أ')).toBeInTheDocument();

    caller = 'B';
    view.rerenderWithScope(<RequestDetailsPage requestId={REQUEST_ID} />, SCOPE_B);

    expect(screen.queryByText('طلب يخص المستخدم أ')).not.toBeInTheDocument(); // same commit, no flash
    expect(screen.getByText('جارٍ تحميل الطلب…')).toBeInTheDocument();
    expect(await screen.findByText('طلب يخص المستخدم ب')).toBeInTheDocument();
    // The old scope's cache entries are gone, not merely hidden.
    expect(view.queryClient.getQueryCache().findAll({ queryKey: ['requests', 'dept-1:user-a'] })).toHaveLength(0);
  });
});
