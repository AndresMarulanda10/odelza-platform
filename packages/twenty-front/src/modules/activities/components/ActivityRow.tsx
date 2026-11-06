import { styled } from '@linaria/react';
import React from 'react';
import { CardContent } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowContentContainer = styled.div`
  > div {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    gap: ${odelzaThemeCssVariables.spacing[2]};
    height: ${odelzaThemeCssVariables.spacing[12]};
    padding: ${odelzaThemeCssVariables.spacing[0]}
      ${odelzaThemeCssVariables.spacing[4]};
  }

  > div[data-clickable='false'] {
    cursor: default;
  }
`;

export const ActivityRow = ({
  children,
  onClick,
  disabled,
}: React.PropsWithChildren<{
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}>) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled !== true) {
      onClick?.(event);
    }
  };

  return (
    <StyledRowContentContainer>
      <CardContent onClick={handleClick} isClickable={disabled !== true}>
        {children}
      </CardContent>
    </StyledRowContentContainer>
  );
};
