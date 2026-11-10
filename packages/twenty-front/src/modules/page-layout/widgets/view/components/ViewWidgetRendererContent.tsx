import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { TimelineViewWidget } from '@/page-layout/widgets/view/components/TimelineViewWidget';
import { t } from '@lingui/core/macro';
import { RecordBoardContainer } from '@/object-record/record-board/components/RecordBoardContainer';
import { RecordTableWidgetProvider } from '@/object-record/record-table-widget/components/RecordTableWidgetProvider';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { styled } from '@linaria/react';
import { ViewType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

type ViewWidgetRendererContentProps = {
  objectMetadataId: string;
  viewId: string;
  widgetId: string;
};

export const ViewWidgetRendererContent = ({
  objectMetadataId,
  viewId,
  widgetId,
}: ViewWidgetRendererContentProps) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === objectMetadataId,
  );
  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId,
  });

  if (
    !objectMetadataItem ||
    !view ||
    !view.isActive ||
    view.objectMetadataId !== objectMetadataId ||
    (view.type !== ViewType.KANBAN && view.type !== ViewType.TIMELINE)
  ) {
    return <div role="status">{t`This view is unavailable.`}</div>;
  }

  if (view.type === ViewType.TIMELINE) {
    return (
      <StyledContainer>
        <TimelineViewWidget
          view={view}
          objectMetadataItem={objectMetadataItem}
          widgetId={widgetId}
        />
      </StyledContainer>
    );
  }

  const recordBoardId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    viewId,
  );

  return (
    <RecordTableWidgetProvider
      objectNameSingular={objectMetadataItem.nameSingular}
      viewId={viewId}
      widgetId={widgetId}
      viewType={ViewType.KANBAN}
    >
      <StyledContainer>
        <RecordBoardContainer
          recordBoardId={recordBoardId}
          viewBarId={recordBoardId}
          objectNameSingular={objectMetadataItem.nameSingular}
        />
      </StyledContainer>
    </RecordTableWidgetProvider>
  );
};
