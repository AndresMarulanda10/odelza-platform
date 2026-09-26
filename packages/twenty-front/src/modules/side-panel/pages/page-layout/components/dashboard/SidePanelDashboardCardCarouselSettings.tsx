import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type CardCarouselFieldMapping } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

const StyledNotice = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

export const SidePanelDashboardCardCarouselSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();

  if (widgetInEditMode?.configuration?.configurationType !== 'CARD_CAROUSEL') {
    return null;
  }

  const configuration = widgetInEditMode.configuration as {
    fieldMapping?: CardCarouselFieldMapping | null;
    cardLayout?: string | null;
    imageAspect?: string | null;
    cardSize?: string | null;
    hoverEffect?: string | null;
  };

  const objectOptions: SelectOption<string>[] = readableObjectMetadataItems.map(
    (item) => ({
      label: item.labelPlural ?? item.namePlural,
      value: item.id,
    }),
  );

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const objectField = (
    <StyledField>
      <Select
        dropdownId="card-carousel-object"
        fullWidth
        label={t`Object`}
        options={objectOptions}
        value={widgetInEditMode.objectMetadataId ?? ''}
        onChange={(value) =>
          updateCurrentWidgetConfig({ objectMetadataId: value })
        }
      />
    </StyledField>
  );

  if (!isDefined(objectMetadataItem)) {
    return (
      <StyledContainer>
        <StyledSettings>
          {objectField}
          <StyledNotice>
            {t`Pick an object to choose its fields and show its records.`}
          </StyledNotice>
        </StyledSettings>
        <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
      </StyledContainer>
    );
  }

  const mapping = configuration.fieldMapping ?? {};

  const fieldOptions: SelectOption<string>[] = objectMetadataItem.fields.map(
    (field) => ({
      label: field.label ?? field.name,
      value: field.id,
    }),
  );

  const notConfiguredOption: SelectOption<string> = {
    label: t`Not configured`,
    value: '',
  };

  const updateMapping = (
    key:
      | 'imageFieldMetadataId'
      | 'titleFieldMetadataId'
      | 'subtitleFieldMetadataId'
      | 'priceFieldMetadataId',
    value: string,
  ) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        fieldMapping: { ...mapping, [key]: value === '' ? null : value },
      },
    });
  };

  const updateSetting = (
    key: 'cardLayout' | 'imageAspect' | 'cardSize' | 'hoverEffect',
    value: string,
  ) => {
    updateCurrentWidgetConfig({ configToUpdate: { [key]: value } });
  };

  const layoutOptions: SelectOption<string>[] = [
    { label: t`Image on top`, value: 'imageTop' },
    { label: t`Image centered`, value: 'imageCenter' },
    { label: t`Image behind the text`, value: 'imageOverlay' },
    { label: t`Only text`, value: 'textOnly' },
  ];

  const aspectOptions: SelectOption<string>[] = [
    { label: t`Square`, value: 'square' },
    { label: t`Portrait`, value: 'portrait' },
    { label: t`Wide`, value: 'wide' },
    { label: t`Circle`, value: 'circle' },
  ];

  const sizeOptions: SelectOption<string>[] = [
    { label: t`Small`, value: 'sm' },
    { label: t`Medium`, value: 'md' },
    { label: t`Large`, value: 'lg' },
  ];

  const hoverOptions: SelectOption<string>[] = [
    { label: t`Lift`, value: 'lift' },
    { label: t`Scale`, value: 'scale' },
    { label: t`Glow`, value: 'glow' },
    { label: t`None`, value: 'none' },
  ];

  return (
    <StyledContainer>
      <StyledSettings>
        {objectField}
        <StyledField>
          <Select
            dropdownId="card-carousel-image-field"
            emptyOption={notConfiguredOption}
            fullWidth
            label={t`Image field`}
            options={fieldOptions}
            value={mapping.imageFieldMetadataId ?? ''}
            onChange={(value) => updateMapping('imageFieldMetadataId', value)}
          />
        </StyledField>
        <StyledField>
          <Select
            dropdownId="card-carousel-title-field"
            emptyOption={notConfiguredOption}
            fullWidth
            label={t`Title field`}
            options={fieldOptions}
            value={mapping.titleFieldMetadataId ?? ''}
            onChange={(value) => updateMapping('titleFieldMetadataId', value)}
          />
        </StyledField>
        <StyledField>
          <Select
            dropdownId="card-carousel-subtitle-field"
            emptyOption={notConfiguredOption}
            fullWidth
            label={t`Subtitle field`}
            options={fieldOptions}
            value={mapping.subtitleFieldMetadataId ?? ''}
            onChange={(value) =>
              updateMapping('subtitleFieldMetadataId', value)
            }
          />
        </StyledField>
        <StyledField>
          <Select
            dropdownId="card-carousel-price-field"
            emptyOption={notConfiguredOption}
            fullWidth
            label={t`Price field`}
            options={fieldOptions}
            value={mapping.priceFieldMetadataId ?? ''}
            onChange={(value) => updateMapping('priceFieldMetadataId', value)}
          />
        </StyledField>
        <StyledField>
          <Select
            dropdownId="card-carousel-layout"
            fullWidth
            label={t`Card layout`}
            options={layoutOptions}
            value={configuration.cardLayout ?? 'imageTop'}
            onChange={(value) => updateSetting('cardLayout', value)}
          />
        </StyledField>
        <StyledField>
          <Select
            dropdownId="card-carousel-image-aspect"
            fullWidth
            label={t`Image shape`}
            options={aspectOptions}
            value={configuration.imageAspect ?? 'square'}
            onChange={(value) => updateSetting('imageAspect', value)}
          />
        </StyledField>
        <StyledField>
          <Select
            dropdownId="card-carousel-size"
            fullWidth
            label={t`Card size`}
            options={sizeOptions}
            value={configuration.cardSize ?? 'md'}
            onChange={(value) => updateSetting('cardSize', value)}
          />
        </StyledField>
        <StyledField>
          <Select
            dropdownId="card-carousel-hover"
            fullWidth
            label={t`Hover effect`}
            options={hoverOptions}
            value={configuration.hoverEffect ?? 'lift'}
            onChange={(value) => updateSetting('hoverEffect', value)}
          />
        </StyledField>
      </StyledSettings>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledContainer>
  );
};
