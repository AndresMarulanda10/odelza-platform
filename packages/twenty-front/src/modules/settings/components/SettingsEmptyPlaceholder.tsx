import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type ThemeSpacingKey = keyof typeof odelzaThemeCssVariables.spacing;

type SettingsEmptyPlaceholderProps = {
  children: ReactNode;
  padding?: ThemeSpacingKey;
  textAlign?: 'left' | 'center' | 'right';
};

const StyledPlaceholder = styled.div<{
  placeholderPadding: string;
  placeholderTextAlign: string;
}>`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  padding: ${({ placeholderPadding }) => placeholderPadding};
  text-align: ${({ placeholderTextAlign }) => placeholderTextAlign};
`;

export const SettingsEmptyPlaceholder = ({
  children,
  padding = '8',
  textAlign = 'center',
}: SettingsEmptyPlaceholderProps) => {
  return (
    <StyledPlaceholder
      placeholderPadding={odelzaThemeCssVariables.spacing[padding]}
      placeholderTextAlign={textAlign}
    >
      {children}
    </StyledPlaceholder>
  );
};
