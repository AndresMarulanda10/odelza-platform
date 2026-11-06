import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

// oxlint-disable-next-line twenty/styled-components-prefixed-with-styled
export const OverlayContainer = styled.div<{
  borderRadius?: 'sm' | 'md';
  hasDangerBorder?: boolean;
}>`
  align-items: center;
  backdrop-filter: ${odelzaThemeCssVariables.blur.medium};

  background: ${odelzaThemeCssVariables.background.transparent.primary};

  border: 1px solid
    ${({ hasDangerBorder }) =>
      odelzaThemeCssVariables.border.color[
        hasDangerBorder ? 'danger' : 'medium'
      ]};

  border-radius: ${({ borderRadius }) =>
    odelzaThemeCssVariables.border.radius[borderRadius ?? 'md']};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.strong};
  display: flex;

  overflow: hidden;

  z-index: 30;
`;
