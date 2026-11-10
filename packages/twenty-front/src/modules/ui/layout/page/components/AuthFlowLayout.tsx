import { styled } from '@linaria/react';
import { Outlet } from 'react-router-dom';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledBackground = styled.div`
  background: ${odelzaThemeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
`;

export const AuthFlowLayout = () => (
  <StyledBackground>
    <Outlet />
  </StyledBackground>
);
