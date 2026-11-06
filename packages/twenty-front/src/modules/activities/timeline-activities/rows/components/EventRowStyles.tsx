import { styled } from '@linaria/react';

import {
  MOBILE_VIEWPORT,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

export const StyledEventRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  justify-content: space-between;
`;

export const StyledEventRowContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  overflow: hidden;
`;

export const StyledEventRowDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  padding: 0 ${odelzaThemeCssVariables.spacing[1]};
`;

export const StyledEventRowLinkedRecord = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  text-decoration: underline;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;
