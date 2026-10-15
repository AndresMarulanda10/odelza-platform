import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
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
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

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
