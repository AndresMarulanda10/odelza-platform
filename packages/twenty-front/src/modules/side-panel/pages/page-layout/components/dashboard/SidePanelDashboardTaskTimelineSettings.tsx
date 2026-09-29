import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  CoreObjectNameSingular,
  type TaskTimelineFieldMapping,
} from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';
import { DEFAULT_TASK_TIMELINE_BAR_COLOR } from 'twenty-shared/constants';
import { type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledSettings = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledColorControl = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[8]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledColorInput = styled.input`
  background: transparent;
  border: 0;
  cursor: pointer;
  height: ${themeCssVariables.spacing[6]};
  padding: 0;
  width: ${themeCssVariables.spacing[6]};

  &:focus-visible {
    border-radius: ${themeCssVariables.border.radius.sm};
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
`;

const StyledColorValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family}, monospace;
  font-size: ${themeCssVariables.font.size.sm};
`;

export const SidePanelDashboardTaskTimelineSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Task,
  });

  if (widgetInEditMode?.configuration?.configurationType !== 'TASK_TIMELINE') {
    return null;
  }

  const configuration = widgetInEditMode.configuration as {
    fieldMapping?: TaskTimelineFieldMapping | null;
    barColor?: string | null;
  };
  const mapping = configuration.fieldMapping ?? {};
  const dateFields = objectMetadataItem.fields.filter((field) =>
    isFieldMetadataDateKind(field.type),
  );
  const dateFieldOptions: SelectOption<string>[] = dateFields.map((field) => ({
    label: field.label ?? field.name,
    value: field.id,
  }));
  const emptyDateOption: SelectOption<string> = {
    label: t`Not configured`,
    value: '',
  };
  const barColor = configuration.barColor ?? DEFAULT_TASK_TIMELINE_BAR_COLOR;

  const updateMapping = (
    key: 'startDateFieldMetadataId' | 'dueDateFieldMetadataId',
    value: string,
  ) => {
    const nextMapping: TaskTimelineFieldMapping = {
      ...mapping,
      [key]: value || null,
    };
    updateCurrentWidgetConfig({
      configToUpdate: { fieldMapping: nextMapping },
    });
  };

  return (
    <StyledContainer>
      <StyledSettings>
        <StyledField>
          <Select
            dropdownId="task-timeline-start-date-field"
            emptyOption={emptyDateOption}
            fullWidth
            label={t`Start date field`}
            options={dateFieldOptions}
            value={mapping.startDateFieldMetadataId ?? ''}
            onChange={(value) =>
              updateMapping('startDateFieldMetadataId', value)
            }
          />
        </StyledField>
        <StyledField>
          <Select
            dropdownId="task-timeline-end-date-field"
            emptyOption={emptyDateOption}
            fullWidth
            label={t`End date field`}
            options={dateFieldOptions}
            value={mapping.dueDateFieldMetadataId ?? ''}
            onChange={(value) => updateMapping('dueDateFieldMetadataId', value)}
          />
        </StyledField>
        <StyledField>
          <StyledLabel htmlFor="task-timeline-bar-color">
            {t`Task bar color`}
          </StyledLabel>
          <StyledColorControl>
            <StyledColorInput
              id="task-timeline-bar-color"
              aria-label={t`Task bar color`}
              type="color"
              value={barColor}
              onChange={(event) =>
                updateCurrentWidgetConfig({
                  configToUpdate: { barColor: event.target.value },
                })
              }
            />
            <StyledColorValue aria-label={t`Selected color`}>
              {barColor}
            </StyledColorValue>
          </StyledColorControl>
        </StyledField>
      </StyledSettings>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledContainer>
  );
};
