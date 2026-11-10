import { styled } from '@linaria/react';
import React from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledPanel = styled.div`
  background: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
`;

type PagePanelProps = {
  children: React.ReactNode;
  hasInformationBar?: boolean;
};

export const PagePanel = ({ children }: PagePanelProps) => (
  <StyledPanel>{children}</StyledPanel>
);
