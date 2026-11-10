import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type EventRowItemProps = {
  children: ReactNode;
  variant?: 'column' | 'action';
};

const StyledColumn = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledAction = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: row;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

export const EventRowItem = ({
  children,
  variant = 'column',
}: EventRowItemProps) => {
  if (variant === 'action') {
    return <StyledAction>{children}</StyledAction>;
  }

  return <StyledColumn>{children}</StyledColumn>;
};
