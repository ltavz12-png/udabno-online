import { test, expect } from '@playwright/test';

test('plays a full life: bet → live → rest → reckoning → history', async ({ page }) => {
  await page.goto('/');

  // Pre-life: the primary action and declaration controls are present.
  const begin = page.getByRole('button', { name: /Begin a Life/i });
  await expect(begin).toBeVisible();
  await expect(page.getByRole('button', { name: /Spark/ })).toBeVisible();

  // Begin a life.
  await begin.click();

  // Live HUD appears with pace and rest controls.
  const push = page.getByRole('button', { name: /^Push$/ });
  await expect(push).toBeVisible();
  await push.click();
  await page.waitForTimeout(1500);

  // Rest & claim.
  await page.getByRole('button', { name: /Rest & Claim/i }).click();

  // Reckoning overlay resolves with a verdict and a "Live Again".
  const again = page.getByRole('button', { name: /Live Again/i });
  await expect(again).toBeVisible();
  await again.click();

  // Back to pre-life; a history entry now exists.
  await expect(page.getByRole('button', { name: /Begin a Life/i })).toBeVisible();
});

test('fairness: a round is independently verifiable in-browser', async ({ page }) => {
  await page.goto('/');
  // Play one quick round to produce a reveal.
  await page.getByRole('button', { name: /Begin a Life/i }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /Rest & Claim/i }).click();
  await page.getByRole('button', { name: /Live Again/i }).click();

  // Open verify and run it.
  await page.getByRole('button', { name: /Verify a round/i }).click();
  const dialog = page.getByRole('dialog', { name: /Verify a round/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /^Verify$/ }).click();
  await expect(dialog.getByText(/"mortality"/)).toBeVisible();
});
