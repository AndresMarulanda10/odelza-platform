import { type Page } from '@playwright/test';
import { expect, test } from '../lib/fixtures/screenshot';
import { backendGraphQLUrl } from '../lib/requests/backend';
import { getAccessAuthToken } from '../lib/utils/getAccessAuthToken';

const metadataGraphQLUrl = new URL(
  '/metadata',
  process.env.BACKEND_BASE_URL,
).toString();

const FIND_DASHBOARD_RECORD = `
  query FindDashboardRecord {
    dashboards(first: 10) {
      edges {
        node {
          id
          pageLayoutId
        }
      }
    }
  }
`;

const FIND_PAGE_LAYOUT = `
  query FindPageLayout($id: String!) {
    getPageLayout(id: $id) {
      id
      tabs {
        id
        widgets {
          id
          title
          type
          configuration {
            __typename
          }
        }
      }
    }
  }
`;

const CREATE_WIDGET = `
  mutation CreatePageLayoutWidget($input: CreatePageLayoutWidgetInput!) {
    createPageLayoutWidget(input: $input) {
      id
      title
      type
    }
  }
`;

const UPDATE_WIDGET = `
  mutation UpdatePageLayoutWidget(
    $id: String!
    $input: UpdatePageLayoutWidgetInput!
  ) {
    updatePageLayoutWidget(id: $id, input: $input) {
      id
      title
      type
    }
  }
`;

const DESTROY_WIDGET = `
  mutation DestroyPageLayoutWidget($id: String!) {
    destroyPageLayoutWidget(id: $id)
  }
`;

const DUPLICATE_DASHBOARD = `
  mutation DuplicateDashboard($id: UUID!) {
    duplicateDashboard(id: $id) {
      id
      pageLayoutId
    }
  }
`;

const DESTROY_DASHBOARD = `
  mutation DestroyOneDashboard($idToDestroy: UUID!) {
    destroyDashboard(id: $idToDestroy) {
      id
    }
  }
`;

type GraphQLResponse<T> = {
  data?: T;
  errors?: unknown[];
};

const postGraphQL = async <T>(
  page: Page,
  url: string,
  query: string,
  variables: Record<string, unknown> = {},
) => {
  const { authToken } = await getAccessAuthToken(page);
  const response = await page.request.post(url, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { query, variables },
  });
  const body = (await response.json()) as GraphQLResponse<T>;

  expect(response.ok(), JSON.stringify(body.errors)).toBeTruthy();
  expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();

  return body.data as T;
};

test.describe.serial('Create new page-layout widgets', () => {
  test('persists create/edit/duplicate and exposes partial and denied states', async ({
    page,
  }) => {
    const dashboardData = await postGraphQL<{
      dashboards: {
        edges: Array<{ node: { id: string; pageLayoutId: string | null } }>;
      };
    }>(page, backendGraphQLUrl, FIND_DASHBOARD_RECORD);
    const dashboard = dashboardData.dashboards.edges
      .map(({ node }) => node)
      .find(({ pageLayoutId }) => pageLayoutId !== null);

    expect(dashboard).toBeDefined();
    const pageLayoutId = dashboard?.pageLayoutId;
    if (!dashboard || pageLayoutId === null) {
      throw new Error('The e2e workspace has no dashboard page layout');
    }

    const layoutData = await postGraphQL<{
      getPageLayout: {
        tabs: Array<{ id: string; widgets: Array<{ id: string }> }>;
      };
    }>(page, metadataGraphQLUrl, FIND_PAGE_LAYOUT, { id: pageLayoutId });
    const tab = layoutData.getPageLayout.tabs[0];
    expect(tab).toBeDefined();
    if (tab === undefined) {
      throw new Error('The e2e dashboard has no page-layout tab');
    }

    let widgetId: string | undefined;
    let financeWidgetId: string | undefined;
    let duplicateDashboardId: string | undefined;

    try {
      const created = await postGraphQL<{
        createPageLayoutWidget: { id: string; title: string; type: string };
      }>(page, metadataGraphQLUrl, CREATE_WIDGET, {
        input: {
          title: 'E2E Task Timeline',
          type: 'TASK_TIMELINE',
          configuration: { configurationType: 'TASK_TIMELINE' },
          pageLayoutTabId: tab.id,
          gridPosition: { column: 0, columnSpan: 4, row: 0, rowSpan: 4 },
        },
      });
      widgetId = created.createPageLayoutWidget.id;

      const financeCreated = await postGraphQL<{
        createPageLayoutWidget: { id: string; title: string; type: string };
      }>(page, metadataGraphQLUrl, CREATE_WIDGET, {
        input: {
          title: 'E2E Personal Finance',
          type: 'PERSONAL_FINANCE',
          configuration: { configurationType: 'PERSONAL_FINANCE' },
          pageLayoutTabId: tab.id,
          gridPosition: { column: 0, columnSpan: 4, row: 4, rowSpan: 4 },
        },
      });
      financeWidgetId = financeCreated.createPageLayoutWidget.id;

      const updatedTitle = 'E2E Task Timeline Edited';
      await postGraphQL(page, metadataGraphQLUrl, UPDATE_WIDGET, {
        id: widgetId,
        input: { title: updatedTitle },
      });

      await page.goto(`/object/dashboard/${dashboard.id}`);
      await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
      await expect(page.getByText('Timeline data is incomplete')).toBeVisible();
      await expect(
        page.getByText('Personal-finance data unavailable'),
      ).toBeVisible();

      const duplicate = await postGraphQL<{
        duplicateDashboard: { id: string; pageLayoutId: string };
      }>(page, metadataGraphQLUrl, DUPLICATE_DASHBOARD, {
        id: dashboard.id,
      });
      duplicateDashboardId = duplicate.duplicateDashboard.id;

      const duplicatedLayout = await postGraphQL<{
        getPageLayout: {
          tabs: Array<{
            widgets: Array<{
              title: string;
              type: string;
              configuration: { __typename: string };
            }>;
          }>;
        };
      }>(page, metadataGraphQLUrl, FIND_PAGE_LAYOUT, {
        id: duplicate.duplicateDashboard.pageLayoutId,
      });
      const duplicatedWidgets = duplicatedLayout.getPageLayout.tabs.flatMap(
        ({ widgets }) => widgets,
      );
      expect(duplicatedWidgets).toContainEqual(
        expect.objectContaining({
          title: updatedTitle,
          type: 'TASK_TIMELINE',
          configuration: { __typename: 'TaskTimelineConfiguration' },
        }),
      );
      expect(duplicatedWidgets).toContainEqual(
        expect.objectContaining({
          title: 'E2E Personal Finance',
          type: 'PERSONAL_FINANCE',
          configuration: { __typename: 'PersonalFinanceConfiguration' },
        }),
      );

      const deniedResponse = await page.request.post(metadataGraphQLUrl, {
        data: { query: FIND_PAGE_LAYOUT, variables: { id: pageLayoutId } },
      });
      const deniedBody =
        (await deniedResponse.json()) as GraphQLResponse<unknown>;
      expect(deniedResponse.ok() && deniedBody.errors === undefined).toBe(
        false,
      );
    } finally {
      if (widgetId !== undefined) {
        await postGraphQL(page, metadataGraphQLUrl, DESTROY_WIDGET, {
          id: widgetId,
        });
      }
      if (financeWidgetId !== undefined) {
        await postGraphQL(page, metadataGraphQLUrl, DESTROY_WIDGET, {
          id: financeWidgetId,
        });
      }
      if (duplicateDashboardId !== undefined) {
        await postGraphQL(page, backendGraphQLUrl, DESTROY_DASHBOARD, {
          idToDestroy: duplicateDashboardId,
        });
      }
    }
  });
});
