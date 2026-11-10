import { styled } from '@linaria/react';
import React from 'react';
import { Label } from 'twenty-ui/typography';
import { isDefined } from 'twenty-shared/utils';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledGroupHeadingContainer = styled.div`
  align-items: center;
  padding-bottom: ${odelzaThemeCssVariables.spacing[1]};
  padding-left: ${odelzaThemeCssVariables.spacing[1]};
  padding-right: ${odelzaThemeCssVariables.spacing[1]};
  padding-top: ${odelzaThemeCssVariables.spacing[2]};
  user-select: none;
`;

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[0.5]};
`;

type SidePanelGroupProps = {
  heading: string;
  children: React.ReactNode | React.ReactNode[];
};

export const SidePanelGroup = ({ heading, children }: SidePanelGroupProps) => {
  if (!isDefined(children) || !React.Children.count(children)) {
    return null;
  }
  return (
    <>
      <StyledGroupHeadingContainer>
        <Label>{heading}</Label>
      </StyledGroupHeadingContainer>
      <StyledGroup>{children}</StyledGroup>
    </>
  );
};
