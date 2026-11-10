import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type StyledCardContentProps = {
  disabled?: boolean;
  alignItems?: 'center' | 'flex-start';
  fullHeight?: boolean;
};

export const StyledSettingsCardContent = styled.div<StyledCardContentProps>`
  align-items: ${({ alignItems }) => alignItems ?? 'center'};
  background-color: ${odelzaThemeCssVariables.background.secondary};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[3]};
  height: ${({ fullHeight }) => (fullHeight ? '100%' : 'auto')};
  padding: ${odelzaThemeCssVariables.spacing[4]};
`;
export const StyledSettingsCardIcon = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.primary};
  border: 2px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  display: flex;
  height: ${odelzaThemeCssVariables.spacing[7]};
  justify-content: center;
  min-width: ${odelzaThemeCssVariables.icon.size.md};
  width: ${odelzaThemeCssVariables.spacing[7]};
`;

export const StyledSettingsCardTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  margin-bottom: ${odelzaThemeCssVariables.spacing[1]};
`;

export const StyledSettingsCardTextContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

export const StyledSettingsCardDescription = styled.div`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  line-height: ${odelzaThemeCssVariables.text.lineHeight.lg};
  overflow: hidden;

  a {
    pointer-events: auto;
    position: relative;
    z-index: 1;
  }
`;

export const StyledSettingsCardThirdLine = styled.div`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  margin-top: ${odelzaThemeCssVariables.spacing[1]};
`;
