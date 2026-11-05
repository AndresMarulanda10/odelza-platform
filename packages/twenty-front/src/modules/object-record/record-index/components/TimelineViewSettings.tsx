import { useState } from 'react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getTimelineFields } from '@/page-layout/widgets/task-timeline/utils/timelineSource';
import { Select } from '@/ui/input/components/Select';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { TimelineColorDropdown } from '@/page-layout/widgets/task-timeline/components/TimelineColorDropdown';
import { Button } from 'twenty-ui/input';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { type View } from '@/views/types/View';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { DEFAULT_TASK_TIMELINE_BAR_COLOR } from 'twenty-shared/constants';

const StyledSettings = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

export const TimelineViewSettings = ({
  view,
  objectMetadataItem,
  instanceId,
}: {
  view: Pick<View, 'timelineConfiguration'>;
  objectMetadataItem: EnrichedObjectMetadataItem;
  instanceId: string;
}) => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { updateCurrentView } = useUpdateCurrentView();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const permissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );
  const fields = permissions
    ? getTimelineFields(objectMetadataItem, permissions, 'date')
    : [];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const configuration = view.timelineConfiguration;
  const persist = async (
    patch: Partial<NonNullable<View['timelineConfiguration']>>,
  ) => {
    if (!canPersistChanges || saving) return;
    setSaving(true);
    setError(undefined);
    try {
      await updateCurrentView({
        timelineConfiguration: { ...configuration, ...patch },
      });
    } catch {
      setError(t`Unable to save timeline settings. Try again.`);
    } finally {
      setSaving(false);
    }
  };
  return (
    <StyledSettings>
      {(
        [
          ['startDateFieldMetadataUniversalIdentifier', t`Start date`],
          ['endDateFieldMetadataUniversalIdentifier', t`End date`],
        ] as const
      ).map(([key, label]) => (
        <Select
          key={key}
          dropdownId={`${instanceId}-${key}`}
          label={label}
          disabled={!canPersistChanges || saving}
          value={configuration?.[key] ?? ''}
          options={fields.map((field) => ({
            value: field.universalIdentifier,
            label: field.label,
          }))}
          emptyOption={{ value: '', label: t`Not configured` }}
          withSearchInput
          onChange={(value) => persist({ [key]: value || null })}
        />
      ))}
      <Dropdown
        dropdownId={`${instanceId}-bar-color`}
        disableClickForClickableComponent={!canPersistChanges || saving}
        clickableComponent={
          <Button
            title={t`Bar color`}
            disabled={!canPersistChanges || saving}
          />
        }
        dropdownComponents={
          <TimelineColorDropdown
            value={configuration?.barColor ?? DEFAULT_TASK_TIMELINE_BAR_COLOR}
            onChange={(barColor) => persist({ barColor })}
          />
        }
      />
      {saving && <span role="status">{t`Saving…`}</span>}
      {error && <span role="alert">{error}</span>}
    </StyledSettings>
  );
};
