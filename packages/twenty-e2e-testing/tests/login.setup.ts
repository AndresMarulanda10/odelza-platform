import { test as base, expect } from '@playwright/test';
import path from 'path';
import type { GetCurrentUserQuery } from '../../twenty-front/src/generated-metadata/graphql';
import { LoginPage } from '../lib/pom/loginPage';

// fixture
const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

test('Login test', async ({ loginPage, page }) => {
  await test.step('Navigated to login page', async () => {
    await page.goto('/');
  });
  await test.step(
    'Logging in '.concat(page.url(), ' as ', process.env.DEFAULT_LOGIN),
    async () => {
      await page.waitForLoadState('networkidle');
      // Click "Continue with Email" if visible (may be skipped if password is the only auth method)
      await loginPage.clickLoginWithEmailIfVisible();
      await loginPage.typeEmail(process.env.DEFAULT_LOGIN);
      await loginPage.clickContinueButton();
      await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
      await page.waitForLoadState('networkidle');
      const currentUserResponse = page.waitForResponse((response) => {
        const request = response.request();
        return (
          request.method() === 'POST' &&
          new URL(response.url()).pathname === '/metadata' &&
          request.postDataJSON()?.operationName === 'GetCurrentUser'
        );
      });
      const expectedOrigin = new URL(page.url()).origin;
      await loginPage.clickSignInButton();
      const response = await currentUserResponse;
      expect(response.ok()).toBeTruthy();
      const result: { data?: GetCurrentUserQuery; errors?: unknown[] } =
        await response.json();
      expect(result.errors === undefined).toBeTruthy();
      const user = result.data?.currentUser;
      expect(process.env.DEFAULT_LOGIN === 'tim@apple.dev').toBeTruthy();
      expect(user?.email === process.env.DEFAULT_LOGIN).toBeTruthy();
      expect(user?.currentWorkspace?.displayName).toBe('Apple');
      expect(user?.currentWorkspace?.subdomain).toBe('apple');
      expect(
        new URL(user!.currentWorkspace!.workspaceUrls.subdomainUrl).origin,
      ).toBe(expectedOrigin);
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/Welcome, .+/)).not.toBeVisible();
      await expect(page.getByTestId('workspace-dropdown')).toBeVisible();
      expect(new URL(page.url()).origin).toBe(expectedOrigin);
      process.env.LINK = page.url();
    },
  );

  await test.step('Saved auth state', async () => {
    await page.context().storageState({
      path: path.resolve(__dirname, '..', '.auth', 'user.json'),
    });
  });
});
