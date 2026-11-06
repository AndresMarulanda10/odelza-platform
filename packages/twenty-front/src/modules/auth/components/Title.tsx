import { styled } from '@linaria/react';
import React from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { AnimatedEaseIn } from 'twenty-ui/layout';

type TitleProps = React.PropsWithChildren & {
  animate?: boolean;
  noMarginTop?: boolean;
};

const StyledTitle = styled.div<Pick<TitleProps, 'noMarginTop'>>`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.xl};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  margin-bottom: ${odelzaThemeCssVariables.spacing[4]};
  margin-top: ${({ noMarginTop }) =>
    !noMarginTop ? odelzaThemeCssVariables.spacing[4] : '0'};
  text-align: center;
`;

export const Title = ({
  children,
  animate = false,
  noMarginTop = false,
}: TitleProps) => {
  if (animate) {
    return (
      <StyledTitle noMarginTop={noMarginTop}>
        <AnimatedEaseIn>{children}</AnimatedEaseIn>
      </StyledTitle>
    );
  }

  return <StyledTitle noMarginTop={noMarginTop}>{children}</StyledTitle>;
};
