import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type TopBarProps = {
  className?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  bottomComponent?: ReactNode;
  displayBottomBorder?: boolean;
};

const StyledContainer = styled.div`
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;

  margin-left: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledTopBar = styled.div`
  align-items: center;

  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  height: 39px;
  justify-content: space-between;
  padding-right: ${odelzaThemeCssVariables.spacing[2]};

  z-index: 7;
`;

const StyledLeftSection = styled.div`
  display: flex;
`;

const StyledRightSection = styled.div`
  display: flex;
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  gap: ${odelzaThemeCssVariables.betweenSiblingsGap};
`;

export const TopBar = ({
  className,
  leftComponent,
  rightComponent,
  bottomComponent,
}: TopBarProps) => (
  <StyledContainer className={className}>
    <StyledTopBar>
      <StyledLeftSection>{leftComponent}</StyledLeftSection>
      <StyledRightSection>{rightComponent}</StyledRightSection>
    </StyledTopBar>
    {bottomComponent}
  </StyledContainer>
);
