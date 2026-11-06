import { styled } from '@linaria/react';
import { Loader } from 'twenty-ui/feedback';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledProgressText = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  white-space: nowrap;
`;

export const CommandListItemLoader = ({ progress }: { progress: number }) => {
  return (
    <StyledContainer>
      <StyledProgressText>{Math.round(progress)}%</StyledProgressText>
      <Loader />
    </StyledContainer>
  );
};
