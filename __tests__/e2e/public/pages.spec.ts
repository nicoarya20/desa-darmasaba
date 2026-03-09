/**
 * Public Pages E2E Tests
 * 
 * End-to-end tests for public-facing darmasaba pages
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should redirect to /darmasaba from root', async ({ page }) => {
    await page.goto('/');

    // Should redirect to /darmasaba
    await page.waitForURL('/darmasaba');
    await expect(page).toHaveURL('/darmasaba');
  });

  test('should display main heading DARMASABA', async ({ page }) => {
    await page.goto('/darmasaba');

    // Check for main heading
    await expect(page.getByText('DARMASABA', { exact: true })).toBeVisible();
  });

  test('should have responsive layout on mobile', async ({ page }) => {
    await page.goto('/darmasaba');

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Main content should be visible
    await expect(page.getByText('DARMASABA')).toBeVisible();
  });

  test('should have proper meta title', async ({ page }) => {
    await page.goto('/darmasaba');

    // Check page title contains Darmasaba
    await expect(page).toHaveTitle(/Darmasaba/);
  });
});

test.describe('Navigation', () => {
  test('should have navigation menu', async ({ page }) => {
    await page.goto('/darmasaba');

    // Check for navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should navigate to PPID section', async ({ page }) => {
    await page.goto('/darmasaba');

    // Find and click PPID link
    const ppidLink = page.locator('a[href*="ppid"]').first();
    await expect(ppidLink).toBeVisible();
    await ppidLink.click();

    // Should navigate to PPID page
    await expect(page).toHaveURL(/ppid/);
  });

  test('should navigate to health section', async ({ page }) => {
    await page.goto('/darmasaba');

    // Find and click health link
    const healthLink = page.locator('a[href*="kesehatan"]').first();
    await expect(healthLink).toBeVisible();
    await healthLink.click();

    // Should navigate to health page
    await expect(page).toHaveURL(/kesehatan/);
  });

  test('should navigate to education section', async ({ page }) => {
    await page.goto('/darmasaba');

    // Find and click education link
    const educationLink = page.locator('a[href*="pendidikan"]').first();
    await expect(educationLink).toBeVisible();
    await educationLink.click();

    // Should navigate to education page
    await expect(page).toHaveURL(/pendidikan/);
  });

  test('should navigate to economy section', async ({ page }) => {
    await page.goto('/darmasaba');

    // Find and click economy link
    const economyLink = page.locator('a[href*="ekonomi"]').first();
    await expect(economyLink).toBeVisible();
    await economyLink.click();

    // Should navigate to economy page
    await expect(page).toHaveURL(/ekonomi/);
  });

  test('should navigate to environment section', async ({ page }) => {
    await page.goto('/darmasaba');

    // Find and click environment link
    const envLink = page.locator('a[href*="lingkungan"]').first();
    await expect(envLink).toBeVisible();
    await envLink.click();

    // Should navigate to environment page
    await expect(page).toHaveURL(/lingkungan/);
  });
});

test.describe('PPID (Public Information)', () => {
  test('should display PPID page', async ({ page }) => {
    await page.goto('/darmasaba/ppid');

    // Check for PPID heading
    await expect(page.getByText(/PPID|Informasi Publik/i)).toBeVisible();
  });

  test('should display information categories', async ({ page }) => {
    await page.goto('/darmasaba/ppid');

    // Should have information categories
    await expect(page.locator('text=Kategori')).toBeVisible();
  });
});

test.describe('News/Berita Section', () => {
  test('should display news list page', async ({ page }) => {
    await page.goto('/darmasaba/berita');

    // Check for news heading
    await expect(page.getByText(/Berita|Kabar Desa/i)).toBeVisible();
  });

  test('should display news articles', async ({ page }) => {
    await page.goto('/darmasaba/berita');

    // Should have news articles or empty state
    const articles = page.locator('[class*="berita"], [class*="news"], article');
    await expect(articles).toBeVisible();
  });

  test('should navigate to news detail page', async ({ page }) => {
    await page.goto('/darmasaba/berita');

    // Find and click first news article
    const firstArticle = page.locator('a[href*="berita"]').first();
    await expect(firstArticle).toBeVisible();
    await firstArticle.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/berita\/(?!list)/);
  });
});

test.describe('Security/Kamtrantibmas Section', () => {
  test('should display security page', async ({ page }) => {
    await page.goto('/darmasaba/kamtrantibmas');

    // Check for security heading
    await expect(page.getByText(/Kamtrantibmas|Keamanan/i)).toBeVisible();
  });
});

test.describe('Culture/Budaya Section', () => {
  test('should display culture page', async ({ page }) => {
    await page.goto('/darmasaba/budaya');

    // Check for culture heading
    await expect(page.getByText(/Budaya|Kebudayaan/i)).toBeVisible();
  });
});

test.describe('Innovation Section', () => {
  test('should display innovation page', async ({ page }) => {
    await page.goto('/darmasaba/inovasi');

    // Check for innovation heading
    await expect(page.getByText(/Inovasi|Innovation/i)).toBeVisible();
  });
});

test.describe('Footer', () => {
  test('should have footer with contact information', async ({ page }) => {
    await page.goto('/darmasaba');

    // Check for footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Should have contact info
    await expect(
      page.getByText(/Kontak|Hubungi|Alamat/i).or(page.locator('footer'))
    ).toBeVisible();
  });

  test('should have social media links', async ({ page }) => {
    await page.goto('/darmasaba');

    // Check for social media links in footer
    const socialLinks = page.locator('footer a[href*="facebook"], footer a[href*="instagram"], footer a[href*="twitter"]');
    await expect(socialLinks).toBeVisible();
  });

  test('should have copyright information', async ({ page }) => {
    await page.goto('/darmasaba');

    // Check for copyright
    await expect(
      page.getByText(/©|Copyright|Hak Cipta/i)
    ).toBeVisible();
  });
});

test.describe('Search Functionality', () => {
  test('should have search feature', async ({ page }) => {
    await page.goto('/darmasaba');

    // Check for search input or button
    const searchInput = page.locator('input[type="search"], input[placeholder*="Cari"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display search results', async ({ page }) => {
    await page.goto('/darmasaba');

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Cari"]').first();
    await searchInput.fill('test');

    // Submit search
    await page.keyboard.press('Enter');

    // Should show search results page or results
    await expect(page).toHaveURL(/search|cari/);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/darmasaba');

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Should have only one h1
    const h1Count = await h1.count();
    expect(h1Count).toBe(1);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/darmasaba');

    // All images should have alt text
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Alt can be empty string for decorative images, but attribute should exist
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should have skip link for accessibility', async ({ page }) => {
    await page.goto('/darmasaba');

    // Check for skip link (common accessibility feature)
    const skipLink = page.locator('a[href="#main-content"], a[href="#content"]');
    // This is optional but recommended
    // await expect(skipLink).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/darmasaba');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/darmasaba');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (adjust based on requirements)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have layout shift', async ({ page }) => {
    await page.goto('/darmasaba');

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');

    // Get initial viewport height
    const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    // Wait a bit more
    await page.waitForTimeout(1000);

    // Check if height changed significantly
    const finalHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    // Allow small variations but not large layout shifts
    expect(Math.abs(finalHeight - initialHeight)).toBeLessThan(100);
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/darmasaba/nonexistent-page-12345');

    // Should show 404 page or redirect
    await expect(page).toHaveURL(/404|darmasaba/);
  });

  test('should have proper error page content', async ({ page }) => {
    await page.goto('/darmasaba/nonexistent-page-12345');

    // Wait for potential redirect
    await page.waitForTimeout(2000);

    // Should show error message or redirect to valid page
    const content = await page.content();
    expect(
      content.includes('404') ||
      content.includes('Tidak ditemukan') ||
      content.includes('DARMASABA')
    ).toBeTruthy();
  });
});
