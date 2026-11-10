import { styled } from '@linaria/react';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledInputErrorHelper = styled.div`
  color: ${odelzaThemeCssVariables.color.red};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  margin-top: 1px;
  position: absolute;
`;

export const InputErrorHelper = ({
  children,
}: {
  children?: React.ReactNode;
}) => (
  <div>
    {isDefined(children) && (
      <StyledInputErrorHelper aria-live="polite">
        {children}
      </StyledInputErrorHelper>
    )}
  </div>
);
