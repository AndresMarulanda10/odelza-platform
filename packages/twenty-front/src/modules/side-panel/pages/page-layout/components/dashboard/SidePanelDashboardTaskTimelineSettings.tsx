import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import {
  emptyTimelineMapping,
  getTimelineFields,
  getTimelineSources,
  isLegacyTaskSource,
} from '@/page-layout/widgets/task-timeline/utils/timelineSource';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { TimelineSettingsDropdown } from '@/side-panel/pages/page-layout/components/dashboard/TimelineSettingsDropdown';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { DEFAULT_TASK_TIMELINE_BAR_COLOR } from 'twenty-shared/constants';
import { type TaskTimelineFieldMapping } from 'twenty-shared/types';
import {
  IconBox,
  IconCalendar,
  IconColorSwatch,
  IconListDetails,
  IconTypography,
} from 'twenty-ui/icon';
import { MenuItemSelectColor } from 'twenty-ui/navigation';
import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';
import * as RadixColors from '@radix-ui/colors';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledSettings = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const TimelineColorDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  const { colorScheme } = useContext(ThemeContext);
  const [hex, setHex] = useState(value);
  // Native swatches use display-P3 CSS. Persist their corresponding sRGB
  // palette value, because the existing Timeline contract stores six-digit hex.
  const paletteHex = (color: (typeof MAIN_COLOR_NAMES)[number]) => {
    const paletteName =
      color === 'blue' ? 'indigo' : color === 'turquoise' ? 'teal' : color;
    const palette = (RadixColors as Record<string, Record<string, string>>)[
      `${paletteName}${colorScheme === 'dark' ? 'Dark' : ''}`
    ];
    return palette[`${paletteName}9`];
  };
  return (
    <DropdownContent>
      <DropdownMenuSearchInput
        placeholder={t`Hex color`}
        value={hex}
        onChange={(event) => {
          setHex(event.target.value);
          if (/^#[0-9a-fA-F]{6}$/.test(event.target.value))
            onChange(event.target.value);
        }}
      />
      <DropdownMenuItemsContainer>
        {MAIN_COLOR_NAMES.map((color) => (
          <MenuItemSelectColor
            key={color}
            color={color}
            selected={paletteHex(color).toLowerCase() === value.toLowerCase()}
            onClick={() => {
              const nextColor = paletteHex(color);
              if (/^#[0-9a-fA-F]{6}$/.test(nextColor)) {
                setHex(nextColor);
                onChange(nextColor);
              }
            }}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

export const SidePanelDashboardTaskTimelineSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  if (widgetInEditMode?.configuration?.configurationType !== 'TASK_TIMELINE')
    return null;
  const configuration = widgetInEditMode.configuration as {
    fieldMapping?: TaskTimelineFieldMapping | null;
    barColor?: string | null;
  };
  const mapping = configuration.fieldMapping ?? {};
  const sources = getTimelineSources(
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
  );
  const source = sources.find(
    (object) => object.id === widgetInEditMode.objectMetadataId,
  );
  const permissions = source
    ? getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        source.id,
      )
    : undefined;
  const isTask = source !== undefined && isLegacyTaskSource(source);
  const fields = (kind: 'date' | 'title') =>
    source && permissions ? getTimelineFields(source, permissions, kind) : [];
  const roleMenu = (
    key:
      | 'startDateFieldMetadataId'
      | 'dueDateFieldMetadataId'
      | 'titleFieldMetadataId',
    label: string,
    kind: 'date' | 'title',
  ) => {
    const eligible = fields(kind);
    const id = `timeline-${key}`;
    const value = mapping[key];
    const description =
      value == null
        ? isTask && kind === 'date'
          ? t`Automatic`
          : kind === 'title'
            ? t`Record label`
            : t`Not configured`
        : (eligible.find((field) => field.id === value)?.label ??
          t`Unavailable field`);
    return (
      <SelectableListItem key={id} itemId={id}>
        <CommandMenuItemDropdown
          id={id}
          dropdownId={id}
          label={label}
          Icon={kind === 'date' ? IconCalendar : IconTypography}
          description={description}
          contextualTextPosition="right"
          dropdownPlacement="bottom-end"
          dropdownComponents={
            <DropdownContent>
              <TimelineSettingsDropdown
                options={eligible.map((field) => ({
                  id: field.id,
                  label: field.label,
                  searchTerms: [field.name],
                  Icon: kind === 'date' ? IconCalendar : IconTypography,
                }))}
                value={value}
                searchPlaceholder={t`Search fields`}
                emptyLabel={t`No readable compatible fields. Choose another source or update its fields.`}
                clearLabel={
                  isTask && kind === 'date'
                    ? t`Automatic`
                    : kind === 'title'
                      ? t`Record label`
                      : t`Not configured`
                }
                onChange={(next) =>
                  updateCurrentWidgetConfig({
                    configToUpdate: {
                      fieldMapping: { ...mapping, [key]: next },
                    },
                  })
                }
              />
            </DropdownContent>
          }
        />
      </SelectableListItem>
    );
  };
  const barColor = configuration.barColor ?? DEFAULT_TASK_TIMELINE_BAR_COLOR;
  return (
    <StyledContainer>
      <StyledSettings>
        <SidePanelList
          selectableItemIds={[
            'timeline-source',
            'timeline-fields',
            'timeline-color',
          ]}
        >
          <SidePanelGroup heading={t`Settings`}>
            <SelectableListItem itemId="timeline-source">
              <CommandMenuItemDropdown
                id="timeline-source"
                dropdownId="timeline-source"
                label={t`Source`}
                Icon={IconBox}
                description={source?.labelPlural ?? t`Not configured`}
                contextualTextPosition="right"
                dropdownPlacement="bottom-end"
                dropdownComponents={
                  <DropdownContent>
                    <TimelineSettingsDropdown
                      options={[...sources]
                        .sort((a, b) =>
                          a.labelPlural.localeCompare(b.labelPlural),
                        )
                        .map((object) => ({
                          id: object.id,
                          label: object.labelPlural,
                          searchTerms: [object.nameSingular, object.namePlural],
                          Icon: () => (
                            <ObjectMetadataIcon objectMetadataItem={object} />
                          ),
                        }))}
                      value={source?.id}
                      searchPlaceholder={t`Search objects`}
                      emptyLabel={t`No readable active objects available.`}
                      clearLabel={t`Not configured`}
                      onChange={(objectMetadataId) => {
                        if (
                          objectMetadataId !== widgetInEditMode.objectMetadataId
                        )
                          updateCurrentWidgetConfig({
                            objectMetadataId,
                            configToUpdate: {
                              fieldMapping: emptyTimelineMapping(),
                            },
                          });
                      }}
                    />
                  </DropdownContent>
                }
              />
            </SelectableListItem>
            <SelectableListItem itemId="timeline-fields">
              <CommandMenuItemDropdown
                id="timeline-fields"
                dropdownId="timeline-fields"
                label={t`Fields`}
                Icon={IconListDetails}
                description={t`Title and dates`}
                contextualTextPosition="right"
                dropdownPlacement="bottom-end"
                dropdownComponents={
                  <DropdownContent>
                    <SelectableList
                      selectableListInstanceId="timeline-fields"
                      focusId="timeline-fields"
                      selectableItemIdArray={[
                        'timeline-titleFieldMetadataId',
                        'timeline-startDateFieldMetadataId',
                        'timeline-dueDateFieldMetadataId',
                      ]}
                    >
                      {roleMenu(
                        'titleFieldMetadataId',
                        t`Title field`,
                        'title',
                      )}
                      {roleMenu(
                        'startDateFieldMetadataId',
                        t`Start date field`,
                        'date',
                      )}
                      {roleMenu(
                        'dueDateFieldMetadataId',
                        t`End date field`,
                        'date',
                      )}
                    </SelectableList>
                  </DropdownContent>
                }
              />
            </SelectableListItem>
            <SelectableListItem itemId="timeline-color">
              <CommandMenuItemDropdown
                id="timeline-color"
                dropdownId="timeline-color"
                label={t`Bar color`}
                Icon={IconColorSwatch}
                description={barColor}
                contextualTextPosition="right"
                dropdownPlacement="bottom-end"
                dropdownComponents={
                  <TimelineColorDropdown
                    value={barColor}
                    onChange={(color) =>
                      updateCurrentWidgetConfig({
                        configToUpdate: { barColor: color },
                      })
                    }
                  />
                }
              />
            </SelectableListItem>
          </SidePanelGroup>
        </SidePanelList>
        {!source && (
          <div role="status">{t`Choose a readable active source to configure its fields.`}</div>
        )}
        {source && !isTask && (
          <div role="status">{t`Status and dependencies are Task-only. Numeric progress and boolean milestones are retained only when compatible; they are not inferred.`}</div>
        )}
      </StyledSettings>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledContainer>
  );
};
