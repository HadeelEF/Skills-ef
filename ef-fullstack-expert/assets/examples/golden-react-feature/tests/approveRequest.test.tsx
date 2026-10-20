import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, delay, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { RequestDetailsPage } from '../src/features/requests/pages/RequestDetailsPage';
import { REQUEST_ID, V1, V2, createRequestStore, problem } from './fixtures';
import { renderWithProviders } from './renderWithProviders';
import { API, server } from './server';

const approveUrl = `${API}/requests/:id/approval`;

async function renderLoaded() {
  renderWithProviders(<RequestDetailsPage requestId={REQUEST_ID} />);
  await screen.findByRole('heading', { level: 1, name: 'شراء أجهزة حاسب للمختبر' });
}

describe('Approve request journey', () => {
  it('sends the version the user saw, shows the confirmed result and re-reads the truth', async () => {
    const store = createRequestStore();
    server.use(
      store.getHandler,
      http.post(approveUrl, ({ request }) => {
        store.calls.approve.push({ ifMatch: request.headers.get('If-Match') });
        store.approveInStore();
        return HttpResponse.json(
          { id: REQUEST_ID, status: 'Approved', decidedAt: '2026-10-05T09:00:00Z' },
          { headers: { ETag: V2 } },
        );
      }),
    );
    const user = userEvent.setup();
    await renderLoaded();

    // Decimal kept exact end to end (no float rounding of a 20-digit amount).
    expect(screen.getByText(/12,345,678,901,234,567\.25/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'اعتماد الطلب' }));

    expect(await screen.findByText('تم اعتماد الطلب.')).toBeInTheDocument();
    expect(store.calls.approve).toEqual([{ ifMatch: V1 }]);
    await waitFor(() => expect(store.calls.get).toBe(2)); // invalidation re-read after the write
    expect(screen.queryByRole('button', { name: 'اعتماد الطلب' })).not.toBeInTheDocument();
    expect(screen.getByText('معتمد')).toBeInTheDocument();
    // The button disappeared: focus moved to the result instead of being lost on <body>.
    expect(screen.getByText('تم اعتماد الطلب.').closest('[role="status"]')).toHaveFocus();
  });

  it('412: shows the conflict, re-reads the latest version and never re-sends automatically', async () => {
    const store = createRequestStore();
    server.use(
      store.getHandler,
      http.post(approveUrl, ({ request }) => {
        store.calls.approve.push({ ifMatch: request.headers.get('If-Match') });
        store.approveInStore(); // someone else approved it in the meantime
        return problem(412);
      }),
    );
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'اعتماد الطلب' }));

    expect(await screen.findByText(/تغيّر الطلب منذ فتحه/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('معتمد')).toBeInTheDocument());
    expect(store.calls.approve).toHaveLength(1);
  });

  it('unknown outcome: verifies with the server instead of claiming failure or retrying the POST', async () => {
    const store = createRequestStore();
    server.use(
      store.getHandler,
      http.post(approveUrl, ({ request }) => {
        store.calls.approve.push({ ifMatch: request.headers.get('If-Match') });
        store.approveInStore(); // the commit happened…
        return HttpResponse.error(); // …but the response was lost
      }),
    );
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'اعتماد الطلب' }));

    expect(await screen.findByText('تأكدنا من الخادم: الطلب معتمد.')).toBeInTheDocument();
    expect(screen.queryByText(/فشل/)).not.toBeInTheDocument();
    expect(store.calls.approve).toHaveLength(1);
  });

  it('unknown outcome with the server still unreachable: does not guess, offers verification', async () => {
    const store = createRequestStore();
    let offline = false;
    server.use(
      http.get(`${API}/requests/:id`, () => (offline ? HttpResponse.error() : store.readResponse())),
      http.post(approveUrl, () => {
        offline = true;
        return HttpResponse.error();
      }),
    );
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'اعتماد الطلب' }));

    expect(await screen.findByText(/لم نتمكن بعد من التحقق/)).toBeInTheDocument();
    expect(screen.queryByText(/تأكدنا من الخادم/)).not.toBeInTheDocument();
  });

  it('double activation sends a single request', async () => {
    const store = createRequestStore();
    server.use(
      store.getHandler,
      http.post(approveUrl, async ({ request }) => {
        store.calls.approve.push({ ifMatch: request.headers.get('If-Match') });
        await delay(50);
        store.approveInStore();
        return HttpResponse.json({ id: REQUEST_ID, status: 'Approved', decidedAt: '2026-10-05T09:00:00Z' }, { headers: { ETag: V2 } });
      }),
    );
    const user = userEvent.setup();
    await renderLoaded();

    await user.dblClick(screen.getByRole('button', { name: 'اعتماد الطلب' }));

    expect(await screen.findByText('تم اعتماد الطلب.')).toBeInTheDocument();
    expect(store.calls.approve).toHaveLength(1);
  });

  it('409 business rule: shows the localized rule by code, not the server English title', async () => {
    const store = createRequestStore();
    server.use(store.getHandler, http.post(approveUrl, () => problem(409, { code: 'request.self_approval' })));
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'اعتماد الطلب' }));

    expect(await screen.findByText('لا يمكن لمقدم الطلب اعتماد طلبه.')).toBeInTheDocument();
    expect(screen.queryByText('Server title in English')).not.toBeInTheDocument();
  });

  it('500: shows a support reference (traceId) and no raw server text', async () => {
    const store = createRequestStore();
    server.use(store.getHandler, http.post(approveUrl, () => problem(500)));
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'اعتماد الطلب' }));

    expect(await screen.findByText('00-4bf92f3577b34da6a3ce929d0e0e4736-01')).toBeInTheDocument();
    expect(screen.queryByText('Server title in English')).not.toBeInTheDocument();
  });

  it('without the approve action the button is hidden (UX only; the API still authorizes)', async () => {
    const store = createRequestStore({ allowedActions: [] });
    server.use(store.getHandler);
    await renderLoaded();

    expect(screen.queryByRole('button', { name: 'اعتماد الطلب' })).not.toBeInTheDocument();
  });

  it('404 and 403 look the same to the user (no existence disclosure)', async () => {
    server.use(http.get(`${API}/requests/:id`, () => problem(404)));
    renderWithProviders(<RequestDetailsPage requestId={REQUEST_ID} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('الطلب غير موجود أو لا تملك صلاحية عرضه.');
  });
});
