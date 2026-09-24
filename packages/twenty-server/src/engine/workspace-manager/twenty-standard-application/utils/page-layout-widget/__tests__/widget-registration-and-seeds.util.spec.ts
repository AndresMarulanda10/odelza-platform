import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  STANDARD_PAGE_LAYOUTS,
  STANDARD_RECORD_PAGE_LAYOUTS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { AddPlanningWidgetTypesFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-instance-command-fast-1790260990300-add-planning-widget-types';
import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { buildStandardFlatPageLayoutWidgetMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-widget/build-standard-flat-page-layout-widget-metadata-maps.util';
import { computeMyFirstDashboardWidgets } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-widget/compute-my-first-dashboard-widgets.util';

const TEST_LAYOUT_PREFIX = '__widgetRegistrationTest';

const buildRelatedEntityIds = () =>
  new Proxy(
    {},
    {
      get: (_target, objectName: string) => ({
        id: `${objectName}-id`,
        fields: new Proxy(
          {},
          {
            get: (_fields, fieldName: string) => ({
              id: `${fieldName}-id`,
            }),
          },
        ),
        views: {},
      }),
    },
  );

const buildPageLayoutEntityIds = () =>
  new Proxy(
    {},
    {
      get: (_target, layoutName: string) => ({
        tabs: new Proxy(
          {},
          {
            get: (_tabs, tabTitle: string) => ({
              id: `${layoutName}-${tabTitle}-id`,
              widgets: new Proxy(
                {},
                {
                  get: (_widgets, widgetName: string) => ({
                    id: `${layoutName}-${tabTitle}-${widgetName}-id`,
                  }),
                },
              ),
            }),
          },
        ),
      }),
    },
  );

const buildStandardBuilderArgs = () =>
  ({
    now: '2026-09-19T00:00:00.000Z',
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'application-id',
    standardObjectMetadataRelatedEntityIds: buildRelatedEntityIds(),
    standardPageLayoutMetadataRelatedEntityIds: buildPageLayoutEntityIds(),
  }) as never;

const buildRegistrationLayout = (widgetType: WidgetType) => ({
  universalIdentifier: `${TEST_LAYOUT_PREFIX}-${widgetType}`,
  objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: {
    tab1: {
      universalIdentifier: `${TEST_LAYOUT_PREFIX}-${widgetType}-tab`,
      title: 'Registration test tab',
      position: 0,
      icon: null,
      layoutMode: 'GRID',
      widgets: {
        widget: {
          universalIdentifier: `${TEST_LAYOUT_PREFIX}-${widgetType}-widget`,
          title: 'Registration test widget',
          type: widgetType,
          gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
        },
      },
    },
  },
});

describe('planning widget standard registration and seeds', () => {
  const originalStandardPageLayouts = { ...STANDARD_PAGE_LAYOUTS };
  const originalRecordPageLayouts = { ...STANDARD_RECORD_PAGE_LAYOUTS };

  afterEach(() => {
    Object.assign(STANDARD_PAGE_LAYOUTS, originalStandardPageLayouts);
    Object.assign(STANDARD_RECORD_PAGE_LAYOUTS, originalRecordPageLayouts);
    for (const layoutName of Object.keys(STANDARD_PAGE_LAYOUTS)) {
      if (!(layoutName in originalStandardPageLayouts)) {
        delete (STANDARD_PAGE_LAYOUTS as Record<string, unknown>)[layoutName];
      }
    }
    for (const layoutName of Object.keys(STANDARD_RECORD_PAGE_LAYOUTS)) {
      if (!(layoutName in originalRecordPageLayouts)) {
        delete (STANDARD_RECORD_PAGE_LAYOUTS as Record<string, unknown>)[
          layoutName
        ];
      }
    }
  });

  it.each([WidgetType.TASK_TIMELINE, WidgetType.PERSONAL_FINANCE])(
    'maps %s to its configuration type without requiring a dashboard seed',
    (widgetType) => {
      const layoutName = `${TEST_LAYOUT_PREFIX}-${widgetType}`;
      const layout = buildRegistrationLayout(widgetType);
      (STANDARD_PAGE_LAYOUTS as Record<string, unknown>)[layoutName] = {
        ...layout,
        name: 'Registration test layout',
        type: PageLayoutType.RECORD_PAGE,
      };
      (STANDARD_RECORD_PAGE_LAYOUTS as Record<string, unknown>)[layoutName] =
        layout;

      const maps = buildStandardFlatPageLayoutWidgetMetadataMaps(
        buildStandardBuilderArgs(),
      );
      const widget =
        maps.byUniversalIdentifier[
          `${TEST_LAYOUT_PREFIX}-${widgetType}-widget`
        ];

      expect(widget).toMatchObject({
        type: widgetType,
        configuration: {
          configurationType:
            widgetType === WidgetType.TASK_TIMELINE
              ? WidgetConfigurationType.TASK_TIMELINE
              : WidgetConfigurationType.PERSONAL_FINANCE,
        },
        universalConfiguration: {
          configurationType:
            widgetType === WidgetType.TASK_TIMELINE
              ? WidgetConfigurationType.TASK_TIMELINE
              : WidgetConfigurationType.PERSONAL_FINANCE,
        },
      });
    },
  );

  it('does not seed either planning widget in the first dashboard', () => {
    const widgets = computeMyFirstDashboardWidgets(buildStandardBuilderArgs());

    expect(widgets).toHaveLength(8);
    expect(widgets.map(({ type }) => type)).not.toEqual(
      expect.arrayContaining([
        WidgetType.TASK_TIMELINE,
        WidgetType.PERSONAL_FINANCE,
      ]),
    );
  });
});

describe('planning widget enum migration rollback', () => {
  it('keeps the additive migration registered', () => {
    expect(INSTANCE_COMMANDS).toContain(
      AddPlanningWidgetTypesFastInstanceCommand,
    );
  });

  it('retains enum values on rollback so persisted reads remain compatible', async () => {
    const query = jest.fn();
    const queryRunner = { query } as never;
    const command = new AddPlanningWidgetTypesFastInstanceCommand();

    await command.up(queryRunner);
    await command.down(queryRunner);

    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("ADD VALUE IF NOT EXISTS 'TASK_TIMELINE'"),
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("ADD VALUE IF NOT EXISTS 'PERSONAL_FINANCE'"),
    );
    expect(query).toHaveBeenCalledTimes(2);
  });
});
