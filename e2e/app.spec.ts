import { test, expect } from '@playwright/test';

test.describe('App Loading', () => {
  test('should load the homepage correctly', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/World Cup/i);

    // Check that the main content is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    // Unauthenticated users should see login form with Sign In button
    const signInButton = page.getByRole('button', { name: /sign in/i });
    const signUpLink = page.getByRole('link', { name: /sign up/i });

    // Should see the Sign In button and Sign Up link
    await expect(signInButton).toBeVisible();
    await expect(signUpLink).toBeVisible();
  });
});
