import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledFormContainer = styled.div`
  padding-inline: ${odelzaThemeCssVariables.spacing[1]};
`;

export const SidePanelGroupFormContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <StyledFormContainer>{children}</StyledFormContainer>;
};
