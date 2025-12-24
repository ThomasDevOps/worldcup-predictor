import { test, expect } from '@playwright/test';

const TEST_USER = {
  displayName: 'TestUser',
  email: 'test@test.be',
  password: 'test123',
};

test.describe.serial('Authentication', () => {
  test('should sign up a new user', async ({ page }) => {
    test.setTimeout(90000);

    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Fill in the registration form
    await page.getByLabel('Display Name').fill(TEST_USER.displayName);
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm Password').fill(TEST_USER.password);

    // Submit the form
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for request to complete
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check for error message
    const errorLocator = page.locator('.text-live');
    if (await errorLocator.isVisible()) {
      const errorText = await errorLocator.textContent();

      if (errorText?.toLowerCase().includes('already')) {
        console.log('User already exists');
        return;
      }

      throw new Error(`Signup failed with error: ${errorText}`);
    }

    // Should be on dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should login with username and navigate to dashboard', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in the login form with USERNAME (not email)
    await page.getByLabel('Username').fill(TEST_USER.displayName);
    await page.getByLabel('Password').fill(TEST_USER.password);

    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for network to settle
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check for error
    const errorLocator = page.locator('.text-live');
    if (await errorLocator.isVisible()) {
      const errorText = await errorLocator.textContent();
      throw new Error(`Login failed: ${errorText}`);
    }

    // Should be on dashboard after successful login
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
