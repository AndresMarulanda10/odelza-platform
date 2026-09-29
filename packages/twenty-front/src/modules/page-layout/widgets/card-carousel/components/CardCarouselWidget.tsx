import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  CardCarousel,
  type CardCarouselItem,
} from '@/page-layout/widgets/card-carousel/components/CardCarousel';
import { useCardCarouselData } from '@/page-layout/widgets/card-carousel/hooks/useCardCarouselData';
import {
  normalizeCardCarouselHover,
  normalizeCardCarouselImageAspect,
  normalizeCardCarouselLayout,
  normalizeCardCarouselRadius,
  normalizeCardCarouselSize,
  normalizeCardCarouselTextAlign,
} from '@/page-layout/widgets/card-carousel/utils/normalizeCardCarouselConfiguration';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledNotice = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  min-height: 8rem;
  text-align: center;
`;

/*
 * El contenido se monta aparte a proposito: el hook que pide registros necesita
 * el objeto ya resuelto, y no se puede llamar a medias.
 */
const CardCarouselWidgetContent = ({
  widget,
  objectMetadataItem,
}: {
  widget: PageLayoutWidget;
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { status, items, hasConfigurationGap } = useCardCarouselData({
    widget,
    objectMetadataItem,
  });

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const navigate = useNavigateApp();

  /*
   * Al pulsar una tarjeta se abre su registro, como en el tablero: en el panel
   * lateral si el objeto lo admite y, si no, en la pagina del registro.
   */
  const openCardRecord = (item: CardCarouselItem) => {
    const objectNameSingular = objectMetadataItem.nameSingular;

    if (canOpenObjectInSidePanel(objectNameSingular)) {
      openRecordInSidePanel({
        recordId: item.id,
        objectNameSingular,
      });

      return;
    }

    navigate(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: item.id,
    });
  };

  const configuration =
    widget.configuration?.__typename === 'CardCarouselConfiguration'
      ? widget.configuration
      : null;

  if (status === 'loading') {
    return <WidgetSkeletonLoader />;
  }

  if (status === 'error') {
    return (
      <StyledContainer>
        <StyledNotice>
          <span>{t`The records of this widget could not be loaded.`}</span>
        </StyledNotice>
      </StyledContainer>
    );
  }

  if (items.length === 0) {
    return (
      <StyledContainer>
        <StyledNotice>
          <span>{t`There is nothing to show yet.`}</span>
          {hasConfigurationGap && (
            <span>{t`Pick the fields this widget should use.`}</span>
          )}
        </StyledNotice>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <CardCarousel
        items={items}
        onCardClick={openCardRecord}
        layout={normalizeCardCarouselLayout(configuration?.cardLayout)}
        imageAspect={normalizeCardCarouselImageAspect(
          configuration?.imageAspect,
        )}
        showArrows
        showDots
        appearance={{
          radius: normalizeCardCarouselRadius(configuration?.cardRadius),
          size: normalizeCardCarouselSize(configuration?.cardSize),
          textAlign: normalizeCardCarouselTextAlign(configuration?.textAlign),
          hover: normalizeCardCarouselHover(configuration?.hoverEffect),
        }}
      />
    </StyledContainer>
  );
};

export const CardCarouselWidget = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widget.objectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    return (
      <StyledContainer>
        <StyledNotice>
          <span>{t`This widget needs an object to read from.`}</span>
        </StyledNotice>
      </StyledContainer>
    );
  }

  return (
    <CardCarouselWidgetContent
      widget={widget}
      objectMetadataItem={objectMetadataItem}
    />
  );
};
