import { styled } from '@linaria/react';
import { Card } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledListContainer = styled.div`
  width: 100%;

  > * {
    & > :not(:last-child) {
      border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
    }
    overflow: auto;
    width: calc(100% - 2px);
  }
`;

export const ActivityList = ({ children }: React.PropsWithChildren) => {
  return (
    <StyledListContainer>
      <Card>{children}</Card>
    </StyledListContainer>
  );
};
