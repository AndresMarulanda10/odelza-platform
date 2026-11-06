import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { RecordBoardColumnCardContainerSkeletonLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardContainerSkeletonLoader';
import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonCardContainer = styled.div`
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.background.quaternary};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  box-shadow:
    0px 4px 8px 0px ${odelzaThemeCssVariables.color.gray2},
    0px 0px 4px 0px ${odelzaThemeCssVariables.color.gray2};
  color: ${odelzaThemeCssVariables.font.color.primary};
  margin-bottom: ${odelzaThemeCssVariables.spacing[2]};
`;

export const RecordBoardColumnLoadingSkeletonCards = () => {
  return Array.from(
    {
      length: RECORD_BOARD_QUERY_PAGE_SIZE,
    },
    (_, index) => (
      <StyledSkeletonCardContainer key={`${index}`}>
        <RecordBoardColumnCardContainerSkeletonLoader />
      </StyledSkeletonCardContainer>
    ),
  );
};
