import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { CreateRequestForm } from '../src/features/requests/components/CreateRequestForm';
import { problem } from './fixtures';
import { renderWithProviders } from './renderWithProviders';
import { API, server } from './server';

const NEW_ID = '9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d';

async function fillValidDraft(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('عنوان الطلب'), 'أجهزة عرض لقاعات الاجتماعات');
  await user.type(screen.getByLabelText('الوصف 1'), 'جهاز عرض');
  await user.clear(screen.getByLabelText('الكمية 1'));
  await user.type(screen.getByLabelText('الكمية 1'), '2');
  await user.type(screen.getByLabelText('سعر الوحدة 1'), '1500.50');
  await user.click(screen.getByRole('button', { name: 'إضافة بند' }));
  await user.type(screen.getByLabelText('الوصف 2'), 'شاشة');
  await user.type(screen.getByLabelText('سعر الوحدة 2'), '99999');
}

describe('Create request form', () => {
  it('blocks an invalid draft on the client: no request is sent and focus goes to the first error', async () => {
    let posts = 0;
    server.use(http.post(`${API}/requests`, () => {
      posts += 1;
      return HttpResponse.json({ id: NEW_ID }, { status: 201 });
    }));
    const user = userEvent.setup();
    renderWithProviders(<CreateRequestForm onCreated={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'حفظ الطلب' }));

    const title = screen.getByLabelText('عنوان الطلب');
    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(title).toHaveAccessibleDescription('هذا الحقل مطلوب.');
    expect(title).toHaveFocus();
    expect(posts).toBe(0);
  });

  it('maps ValidationProblemDetails to the right field array row and keeps unmatched rules visible', async () => {
    server.use(http.post(`${API}/requests`, () =>
      problem(400, {
        errors: {
          'Items[1].UnitPrice': ['السعر يتجاوز سقف البند المعتمد.'],
          '': ['الميزانية المتبقية للإدارة غير كافية.'],
        },
      }),
    ));
    const user = userEvent.setup();
    renderWithProviders(<CreateRequestForm onCreated={vi.fn()} />);
    await fillValidDraft(user);

    await user.click(screen.getByRole('button', { name: 'حفظ الطلب' }));

    const secondPrice = screen.getByLabelText('سعر الوحدة 2');
    await waitFor(() => expect(secondPrice).toHaveAttribute('aria-invalid', 'true'));
    expect(secondPrice).toHaveAccessibleDescription('السعر يتجاوز سقف البند المعتمد.');
    expect(secondPrice).toHaveFocus();
    expect(screen.getByLabelText('سعر الوحدة 1')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('alert')).toHaveTextContent('الميزانية المتبقية للإدارة غير كافية.');
    // The user's input survives the failed save.
    expect(screen.getByLabelText('عنوان الطلب')).toHaveValue('أجهزة عرض لقاعات الاجتماعات');
  });

  it('after an unknown outcome, re-submitting the same draft reuses the idempotency key', async () => {
    const seen: { key: string | null; body: unknown }[] = [];
    let attempt = 0;
    server.use(http.post(`${API}/requests`, async ({ request }) => {
      seen.push({ key: request.headers.get('Idempotency-Key'), body: await request.json() });
      attempt += 1;
      return attempt === 1 ? HttpResponse.error() : HttpResponse.json({ id: NEW_ID }, { status: 201 });
    }));
    const onCreated = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<CreateRequestForm onCreated={onCreated} />);
    await fillValidDraft(user);

    await user.click(screen.getByRole('button', { name: 'حفظ الطلب' }));
    expect(await screen.findByText(/انقطع الاتصال قبل تأكيد الحفظ/)).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'حفظ الطلب' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(NEW_ID));
    expect(seen).toHaveLength(2);
    expect(seen[0]?.key).toBeTruthy();
    expect(seen[1]?.key).toBe(seen[0]?.key);
    // Command shape: decimals as strings, quantity as a number, no read-only fields.
    expect(seen[1]?.body).toEqual({
      title: 'أجهزة عرض لقاعات الاجتماعات',
      items: [
        { description: 'جهاز عرض', quantity: 2, unitPrice: '1500.50' },
        { description: 'شاشة', quantity: 1, unitPrice: '99999' },
      ],
    });
  });
});
