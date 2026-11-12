import { expect, test as base, type Page } from '@playwright/test';
import { LoginPage } from '../../lib/pom/loginPage';

const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

const submitCredentials = async (
  loginPage: LoginPage,
  email = process.env.DEFAULT_LOGIN!,
  password = process.env.DEFAULT_PASSWORD!,
) => {
  await loginPage.signInWithCredentials(email, password);
};

const loginAndSelectWorkspace = async (loginPage: LoginPage, page: Page) => {
  await page.waitForLoadState('domcontentloaded');
  await submitCredentials(loginPage);
  await page.waitForLoadState('domcontentloaded');

  const workspaceButton = page
    .getByRole('link')
    .filter({ has: page.getByText('Apple', { exact: true }) });

  await expect
    .poll(
      async () => {
        const path = new URL(page.url()).pathname;
        return (
          (!path.includes('welcome') && !path.includes('verify')) ||
          (await workspaceButton.isVisible())
        );
      },
      { timeout: 30000 },
    )
    .toBe(true);

  if (
    new URL(page.url()).pathname === '/welcome' &&
    (await workspaceButton.isVisible())
  ) {
    await workspaceButton.click();
  }

  await page.waitForFunction(
    () =>
      !window.location.href.includes('verify') &&
      !window.location.href.includes('welcome'),
    { timeout: 30000 },
  );
};

test.describe('Return-to-path after login', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should redirect to deep link after login', async ({
    page,
    loginPage,
  }) => {
    const deepLink = '/settings/accounts';

    await test.step('Navigate to deep link while logged out', async () => {
      await page.goto(deepLink);
      await page.waitForURL('**/welcome');
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Log in and select workspace', async () => {
      await loginAndSelectWorkspace(loginPage, page);
    });

    await test.step('Verify redirected to original deep link', async () => {
      await page.waitForURL(`**${deepLink}`, {
        timeout: 30000,
        waitUntil: 'commit',
      });
      expect(new URL(page.url()).pathname).toBe(deepLink);
    });

    await test.step('Verify return-to-path query param was consumed', async () => {
      const url = new URL(page.url());

      expect(url.searchParams.has('returnToPath')).toBe(false);
    });
  });

  test('should preserve path with query params across login', async ({
    page,
    loginPage,
  }) => {
    const targetPath = '/settings/accounts';
    const targetPathWithParams = `${targetPath}?tab=emails&filter=unread`;

    await test.step('Navigate to path with query params while logged out', async () => {
      await page.goto(targetPathWithParams);
      await page.waitForURL('**/welcome');
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Log in and select workspace', async () => {
      await loginAndSelectWorkspace(loginPage, page);
    });

    await test.step('Verify redirected to original path with query params', async () => {
      await page.waitForURL(`**${targetPath}**`, {
        timeout: 30000,
        waitUntil: 'commit',
      });
      const url = new URL(page.url());

      expect(url.pathname).toBe(targetPath);
      expect(url.searchParams.get('tab')).toBe('emails');
      expect(url.searchParams.get('filter')).toBe('unread');
    });
  });
});

test.describe('Login helper protocol', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  const email = 'tim@apple.dev';
  const password = 'public-protocol-fixture';

  for (const initialState of ['Init', 'Email', 'Password', 'RacingInit']) {
    test(`submits credentials once from ${initialState}`, async ({
      page,
      loginPage,
    }) => {
      page.setDefaultTimeout(2000);
      await page.setContent(`
        <input placeholder="Email" value="${email}">
        <input placeholder="Password" hidden>
        <button id="advance">Continue with Email</button>
        <button id="submit" hidden>Sign in</button>
        <button id="sidebar" hidden>Apple</button>
        <output id="receipt"></output>
        <output id="sidebarClicks">0</output>
        <script>
          let stage = ${JSON.stringify(initialState)};
          const advance = document.querySelector('#advance');
          const password = document.querySelector('[placeholder="Password"]');
          const submit = document.querySelector('#submit');
          let submissions = 0;
          function render() {
            document.querySelector('[placeholder="Email"]').hidden = stage === 'Init' || stage === 'RacingInit';
            advance.hidden = stage === 'Password';
            advance.textContent = stage === 'Email' ? 'Continue' : 'Continue with Email';
            password.hidden = stage !== 'Password';
            submit.hidden = stage !== 'Password';
          }
          advance.onpointerdown = () => {
            if (stage === 'RacingInit') { stage = 'Email'; render(); }
          };
          advance.onclick = () => { stage = stage === 'Email' ? 'Password' : 'Email'; render(); };
          submit.onclick = () => {
            submissions++;
            document.querySelector('#receipt').textContent = JSON.stringify({
              submissions,
              email: document.querySelector('[placeholder="Email"]').value,
              password: password.value
            });
            document.querySelector('#sidebar').hidden = false;
          };
          document.querySelector('#sidebar').onclick = () => { document.querySelector('#sidebarClicks').textContent = '1'; };
          render();
        </script>
      `);
      await submitCredentials(loginPage, email, password);
      await expect(page.locator('#receipt')).toHaveText(
        JSON.stringify({
          submissions: 1,
          email,
          password,
        }),
      );
      await expect(page.locator('#sidebarClicks')).toHaveText('0');
    });
  }

  test('rejects an unexpected form instead of silently succeeding', async ({
    page,
    loginPage,
  }) => {
    page.setDefaultTimeout(2000);
    await page.setContent('<button>Apple</button>');
    await expect(
      loginPage.signInWithCredentials('tim@apple.dev', 'fixture', 1000),
    ).rejects.toThrow();
  });
});
