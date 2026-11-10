import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.secondary};
  border-top: 1px solid ${odelzaThemeCssVariables.border.color.light};
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${odelzaThemeCssVariables.spacing[2]}
    ${odelzaThemeCssVariables.spacing[3]};
  width: 100%;
`;

type SidePanelFooterProps = {
  actions: React.ReactNode[];
};

export const SidePanelFooter = ({ actions }: SidePanelFooterProps) => {
  return (
    <StyledContainer>
      {actions.map((action, index) => (
        <Fragment key={index}>{action}</Fragment>
      ))}
    </StyledContainer>
  );
};
