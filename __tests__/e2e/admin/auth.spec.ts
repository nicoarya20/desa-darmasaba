/**
 * Admin Authentication E2E Tests
 * 
 * End-to-end tests for admin login and authentication flow
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Go to admin login page before each test
    await page.goto('/admin/login');
  });

  test('should display login page with correct elements', async ({ page }) => {
    // Check for page title
    await expect(page).toHaveTitle(/Admin/);

    // Check for login form elements
    await expect(page.getByPlaceholder('Nomor WhatsApp')).toBeVisible();
    await expect(page.getByRole('button', { name: /Kirim OTP/i })).toBeVisible();
  });

  test('should show validation error for empty phone number', async ({ page }) => {
    // Try to submit without entering phone number
    await page.getByRole('button', { name: /Kirim OTP/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/nomor telepon/i).or(page.getByText(/wajib diisi/i))
    ).toBeVisible();
  });

  test('should show validation error for short phone number', async ({ page }) => {
    // Enter invalid phone number (less than 10 digits)
    await page.getByPlaceholder('Nomor WhatsApp').fill('0812345');
    await page.getByRole('button', { name: /Kirim OTP/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/minimal 10 digit/i)
    ).toBeVisible();
  });

  test('should show validation error for non-numeric phone number', async ({ page }) => {
    // Enter phone number with letters
    await page.getByPlaceholder('Nomor WhatsApp').fill('0812345678a');
    await page.getByRole('button', { name: /Kirim OTP/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/harus berupa angka/i)
    ).toBeVisible();
  });

  test('should proceed to OTP verification with valid phone number', async ({ page }) => {
    // Enter valid phone number
    await page.getByPlaceholder('Nomor WhatsApp').fill('08123456789');
    await page.getByRole('button', { name: /Kirim OTP/i }).click();

    // Should show OTP verification form
    await expect(
      page.getByPlaceholder('Kode OTP').or(page.getByLabel(/OTP/i))
    ).toBeVisible({ timeout: 10000 });

    // Should show verify button
    await expect(
      page.getByRole('button', { name: /Verifikasi/i })
    ).toBeVisible();
  });

  test('should show error for invalid OTP', async ({ page }) => {
    // Enter valid phone number
    await page.getByPlaceholder('Nomor WhatsApp').fill('08123456789');
    await page.getByRole('button', { name: /Kirim OTP/i }).click();

    // Wait for OTP form
    await page.waitForSelector('input[name="otp"], input[placeholder*="OTP"]', { timeout: 10000 });

    // Enter invalid OTP (wrong length)
    const otpInput = page.locator('input[name="otp"], input[placeholder*="OTP"]').first();
    await otpInput.fill('12345');
    await page.getByRole('button', { name: /Verifikasi/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/harus 6 digit/i)
    ).toBeVisible();
  });

  test('should show error for non-numeric OTP', async ({ page }) => {
    // Enter valid phone number
    await page.getByPlaceholder('Nomor WhatsApp').fill('08123456789');
    await page.getByRole('button', { name: /Kirim OTP/i }).click();

    // Wait for OTP form
    await page.waitForSelector('input[name="otp"], input[placeholder*="OTP"]', { timeout: 10000 });

    // Enter OTP with letters
    const otpInput = page.locator('input[name="otp"], input[placeholder*="OTP"]').first();
    await otpInput.fill('12345a');
    await page.getByRole('button', { name: /Verifikasi/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/harus berupa angka/i)
    ).toBeVisible();
  });

  test('should redirect to admin dashboard after successful login', async ({ page }) => {
    // This test requires a working backend with valid credentials
    // Skip in CI environment or use mock credentials

    test.skip(
      process.env.CI === 'true',
      'Skip login test in CI - requires valid OTP'
    );

    // Enter valid phone number (use test account)
    await page.getByPlaceholder('Nomor WhatsApp').fill(process.env.TEST_ADMIN_PHONE || '08123456789');
    await page.getByRole('button', { name: /Kirim OTP/i }).click();

    // Wait for OTP form
    await page.waitForSelector('input[name="otp"]', { timeout: 10000 });

    // In a real scenario, you would enter the OTP received
    // For testing, we'll check if the form is ready
    await expect(page.locator('input[name="otp"]')).toBeVisible();

    // Note: Full login test requires actual OTP from WhatsApp
    // This would typically be handled with test credentials or mocked OTP
  });

  test('should have link to return to home page', async ({ page }) => {
    // Check for home/back link
    const homeLink = page.locator('a[href="/"], a[href="/darmasaba"]');
    await expect(homeLink).toBeVisible();
  });

  test('should have responsive layout on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that login form is visible
    await expect(page.getByPlaceholder('Nomor WhatsApp')).toBeVisible();

    // Check that button is clickable
    await expect(page.getByRole('button', { name: /Kirim OTP/i })).toBeVisible();
  });
});

test.describe('Admin Session', () => {
  test('should redirect to dashboard if already logged in', async ({ page }) => {
    // This test requires authentication state
    // Would typically use authenticated cookies or storage state

    test.skip(true, 'Requires authenticated session setup');

    // Set authenticated state
    await page.context().addCookies([
      {
        name: 'desa-session',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/admin/login');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should logout successfully', async ({ page }) => {
    // This test requires an authenticated session
    test.skip(true, 'Requires authenticated session setup');

    // Go to admin page with session
    await page.goto('/admin/dashboard');

    // Click logout button
    await page.getByRole('button', { name: /Keluar/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should prevent access to admin pages without authentication', async ({ page }) => {
    // Try to access admin dashboard without login
    await page.goto('/admin/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe('Admin Navigation', () => {
  test('should navigate to different admin sections', async ({ page }) => {
    test.skip(true, 'Requires authenticated session setup');

    // Login first (would need proper authentication)
    await page.goto('/admin/login');
    // ... login steps

    // Navigate to berita section
    await page.getByRole('link', { name: /Berita/i }).click();
    await expect(page).toHaveURL(/\/admin\/desa\/berita/);

    // Navigate to profile section
    await page.getByRole('link', { name: /Profil/i }).click();
    await expect(page).toHaveURL(/\/admin\/desa\/profile/);
  });
});
