import { randomUUID } from 'crypto';
import type {
  ActivateWorkspaceMutation,
  ClientConfig,
  FindManyMarketplaceAppsQuery,
  SkipSyncEmailOnboardingStepMutation,
  TriggerInstallAppsOnboardingStepMutation,
} from '../../../twenty-front/src/generated-metadata/graphql';
import { expect, test } from './fixture';

test.use({ storageState: { cookies: [], origins: [] } });

test('New workspace signup completes automatic onboarding without providers or apps', async ({
  page,
  request,
  loginPage,
}) => {
  test.setTimeout(180000);

  const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
  const email = `test${suffix}@apple.dev`;
  const workspaceName = `Test ${suffix}`;
  const subdomain = `test-${suffix}`;
  let expectedWorkspaceHost: string;

  await test.step('Create a new account', async () => {
    expect(process.env.BACKEND_BASE_URL).toBeTruthy();
    const response = await request.get(
      new URL('/client-config', process.env.BACKEND_BASE_URL).toString(),
    );
    expect(response.ok()).toBeTruthy();
    const clientConfig: ClientConfig = await response.json();
    expect(clientConfig.isMultiWorkspaceEnabled).toEqual(expect.any(Boolean));
    expect(clientConfig.defaultSubdomain).toEqual(expect.any(String));
    expect(clientConfig.frontDomain).toEqual(expect.any(String));
    expect(clientConfig.defaultSubdomain).not.toBe('');
    expect(clientConfig.frontDomain).not.toBe('');
    expect(clientConfig.isGoogleMessagingEnabled).toBe(false);
    expect(clientConfig.isGoogleCalendarEnabled).toBe(false);
    expect(clientConfig.isMicrosoftMessagingEnabled).toBe(false);
    expect(clientConfig.isMicrosoftCalendarEnabled).toBe(false);
    await page.goto('/welcome');
    const globalUrl = new URL(page.url());
    globalUrl.host = clientConfig.isMultiWorkspaceEnabled
      ? `${clientConfig.defaultSubdomain}.${clientConfig.frontDomain}`
      : clientConfig.frontDomain;
    globalUrl.pathname = '/welcome';
    globalUrl.search = '';
    globalUrl.hash = '';
    expectedWorkspaceHost = clientConfig.isMultiWorkspaceEnabled
      ? `${subdomain}.${clientConfig.frontDomain}${globalUrl.port ? `:${globalUrl.port}` : ''}`
      : globalUrl.host;

    await page.goto(globalUrl.toString());
    await expect(page).toHaveURL(globalUrl.toString());
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.typeEmail(email);
    await loginPage.clickContinueButton();
    await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
    expect(new URL(page.url()).origin).toBe(globalUrl.origin);
    await loginPage.clickSignUpButton();
  });

  // Register before workspace creation: automatic steps need not render headings.
  const [activation, emailSkip, marketplace, appSkip] = [
    'ActivateWorkspace',
    'SkipSyncEmailOnboardingStep',
    'FindManyMarketplaceApps',
    'TriggerInstallAppsOnboardingStep',
  ].map((operationName) =>
    page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/metadata' &&
        response.request().postDataJSON()?.operationName === operationName,
      { timeout: 90000 },
    ),
  );

  await test.step('Create the workspace', async () => {
    await expect(page.getByText('Create your workspace')).toBeVisible();
    await loginPage.typeWorkspaceName(workspaceName);
    await loginPage.typeSubdomain(subdomain);
    await loginPage.clickCreateWorkspaceButton();
  });

  await test.step('Workspace activation stage', async () => {
    await page.waitForURL('**/workspace-activation', { timeout: 90000 });
    const response = await activation;
    expect(response.status()).toBe(200);
    const result: { data?: ActivateWorkspaceMutation; errors?: unknown[] } =
      await response.json();
    expect(result.errors).toBeUndefined();
    expect(result.data?.activateWorkspace.id).toEqual(expect.any(String));
    expect(result.data?.activateWorkspace.id).not.toBe('');
    console.log(`Workspace activation verified ${new Date().toISOString()}`);
  });

  await test.step('Automatically skips email sync without OAuth providers', async () => {
    const response = await emailSkip;
    expect(response.status()).toBe(200);
    const result: {
      data?: SkipSyncEmailOnboardingStepMutation;
      errors?: unknown[];
    } = await response.json();
    expect(result.errors).toBeUndefined();
    expect(result.data?.skipSyncEmailOnboardingStep.success).toBe(true);
    console.log(`Automatic email skip verified ${new Date().toISOString()}`);
  });

  await test.step('Automatically skips app installation with an empty marketplace', async () => {
    const availabilityResponse = await marketplace;
    expect(availabilityResponse.status()).toBe(200);
    const availability: {
      data?: FindManyMarketplaceAppsQuery;
      errors?: unknown[];
    } = await availabilityResponse.json();
    expect(availability.errors).toBeUndefined();
    expect(availability.data?.findManyMarketplaceApps).toEqual([]);
    const response = await appSkip;
    expect(response.status()).toBe(200);
    expect(
      response.request().postDataJSON().variables.universalIdentifiers,
    ).toEqual([]);
    const result: {
      data?: TriggerInstallAppsOnboardingStepMutation;
      errors?: unknown[];
    } = await response.json();
    expect(result.errors).toBeUndefined();
    expect(result.data?.triggerInstallAppsOnboardingStep.success).toBe(true);
    console.log(
      `Automatic empty-app skip verified ${new Date().toISOString()}`,
    );
  });

  await test.step('Create-profile stage', async () => {
    await page.waitForURL('**/create/profile');
    await expect(page.getByText('Create profile')).toBeVisible();
    console.log(`Profile form ready ${new Date().toISOString()}`);
    await loginPage.typeFirstName('Ada');
    await loginPage.typeLastName('Lovelace');
    await loginPage.clickContinueButton();
  });

  await test.step('Invite-team stage', async () => {
    await expect(page.getByText('Invite your team')).toBeVisible();
    await loginPage.clickSkipOnboardingStep();
  });

  await test.step('Lands in the app', async () => {
    await expect(page.getByTestId('workspace-dropdown')).toBeVisible();
    expect(new URL(page.url()).host).toBe(expectedWorkspaceHost);
    console.log(
      `Onboarding completed ${page.url()} ${new Date().toISOString()}`,
    );
  });
});
