import { expect, test } from '@playwright/test';

/**
 * NOT EXECUTED in the skill authoring environment (no .NET API, database or IdP test tenant).
 * Runs against a deployed test environment where:
 *  - E2E_REQUEST_ID is a Submitted request in the approver's department, created by another user;
 *  - the browser is already signed in through the BFF (storageState prepared by a setup project).
 * It proves what component tests cannot: real cookies/CSRF, real ProblemDetails, real ETag, real RTL.
 */
const requestId = process.env.E2E_REQUEST_ID ?? '';

test.describe('approve request (UI → API → SQL → read-back)', () => {
  test.skip(requestId === '', 'E2E_REQUEST_ID not provided');

  test('approves, survives a reload and keeps RTL layout', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto(`/requests/${requestId}`);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const approval = page.waitForResponse(
      (r) => r.url().endsWith(`/api/requests/${requestId}/approval`) && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'اعتماد الطلب' }).click();
    const response = await approval;
    expect(response.status()).toBe(200);
    expect(response.request().headers()['if-match']).toMatch(/^"[A-Za-z0-9+/=]+"$/);
    await expect(page.getByRole('status').filter({ hasText: 'تم اعتماد الطلب.' })).toBeVisible();

    await page.reload(); // persisted, not just client state
    await expect(page.getByText('معتمد')).toBeVisible();
    await expect(page.getByRole('button', { name: 'اعتماد الطلب' })).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test('keyboard-only user can approve and keeps focus on the result', async ({ page }) => {
    await page.goto(`/requests/${requestId}`);
    const button = page.getByRole('button', { name: 'اعتماد الطلب' });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status').filter({ hasText: /اعتماد|تغيّر/ })).toBeFocused();
  });
});
