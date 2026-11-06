import { styled } from '@linaria/react';
import { Card } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledCardContainer = styled.div`
  height: 40px;

  > * {
    background-color: ${odelzaThemeCssVariables.background.secondary};
    height: 100%;
  }
`;

export const SettingsListSkeletonCard = () => (
  <StyledCardContainer>
    <Card />
  </StyledCardContainer>
);
