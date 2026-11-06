import { styled } from '@linaria/react';

import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const StyledDialog = styled.div<{ isMobile: boolean }>`
  background: ${odelzaThemeCssVariables.background.primary};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.strong};
  font-family: ${odelzaThemeCssVariables.font.family};
  left: 50%;
  max-width: 400px;
  overflow: hidden;
  padding: 0;
  padding: ${odelzaThemeCssVariables.spacing[1]};
  position: fixed;
  top: 30%;
  transform: ${({ isMobile }) =>
    isMobile ? 'translateX(-49.5%)' : 'translateX(-50%)'};
  width: ${({ isMobile }) => (isMobile ? 'calc(100% - 40px)' : '100%')};
  z-index: 1000;
`;

export const StyledHeading = styled.div`
  align-items: center;
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  justify-content: space-between;
  padding: ${odelzaThemeCssVariables.spacing[3]};
`;

export const StyledContainer = styled.div`
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding-bottom: ${odelzaThemeCssVariables.spacing[4]};
  padding-left: ${odelzaThemeCssVariables.spacing[4]};
  padding-right: ${odelzaThemeCssVariables.spacing[4]};
  padding-top: ${odelzaThemeCssVariables.spacing[1]};
`;

export const StyledGroupHeading = styled.label`
  color: ${odelzaThemeCssVariables.color.gray10};
  padding-bottom: ${odelzaThemeCssVariables.spacing[1]};
  padding-top: ${odelzaThemeCssVariables.spacing[4]};
`;

export const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

export const StyledItem = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  height: 24px;
  justify-content: space-between;
`;

export const StyledShortcutKey = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.strong};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.underline};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  height: 20px;
  justify-content: center;
  padding-left: ${odelzaThemeCssVariables.spacing[1]};
  padding-right: ${odelzaThemeCssVariables.spacing[1]};
  text-align: center;
`;

export const StyledShortcutKeyContainer = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: row;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;
