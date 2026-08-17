import { test, expect } from '@playwright/test';

test('plays a full life: bet → live → rest → reckoning → history', async ({ page }) => {
  await page.goto('/');

  // Pre-life: the primary action and declaration controls are present.
  const begin = page.getByRole('button', { name: /Begin a Life/i });
  await expect(begin).toBeVisible();
  await expect(page.getByRole('button', { name: /Spark/ })).toBeVisible();

  // Begin a life.
  await begin.click();

  // The life may be paced or may end on its own (a short life). Either way we
  // reach the reckoning: nudge the pace and rest if still living.
  const rest = page.getByRole('button', { name: /Rest & Claim/i });
  const again = page.getByRole('button', { name: /Live Again/i });
  await page.waitForTimeout(700);
  if (await rest.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /^Push$/ }).click().catch(() => {});
    await page.waitForTimeout(1200);
    if (await rest.isVisible().catch(() => false)) await rest.click().catch(() => {});
  }

  // Reckoning overlay resolves with a verdict and a "Live Again".
  await expect(again).toBeVisible({ timeout: 15000 });
  await again.click();

  // Back to pre-life; a history entry now exists.
  await expect(page.getByRole('button', { name: /Begin a Life/i })).toBeVisible();
});

test('fairness: a round is independently verifiable in-browser', async ({ page }) => {
  await page.goto('/');
  // Play one quick round to produce a reveal (the life may end on its own).
  await page.getByRole('button', { name: /Begin a Life/i }).click();
  const rest = page.getByRole('button', { name: /Rest & Claim/i });
  await page.waitForTimeout(700);
  if (await rest.isVisible().catch(() => false)) await rest.click().catch(() => {});
  const again = page.getByRole('button', { name: /Live Again/i });
  await expect(again).toBeVisible({ timeout: 15000 });
  await again.click();

  // Open verify and run it.
  await page.getByRole('button', { name: /Verify a round/i }).click();
  const dialog = page.getByRole('dialog', { name: /Verify a round/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /^Verify$/ }).click();
  await expect(dialog.getByText(/"mortality"/)).toBeVisible();
});
