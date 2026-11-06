import React from 'react';
import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export type HeadingProps = {
  title: string;
  description?: string;
  className?: string;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledTitle = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.lg};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  text-align: center;
`;

const StyledDescription = styled.span`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  margin-top: ${odelzaThemeCssVariables.spacing[3]};
  text-align: center;
`;

export const Heading = ({ title, description, className }: HeadingProps) => (
  <StyledContainer className={className}>
    <StyledTitle>{title}</StyledTitle>
    {description && <StyledDescription>{description}</StyledDescription>}
  </StyledContainer>
);
