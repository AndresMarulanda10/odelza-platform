import { styled } from '@linaria/react';
import { Outlet } from 'react-router-dom';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledLayout = styled.div`
  background: ${odelzaThemeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  position: relative;
  scrollbar-width: 4px;
  width: 100%;
`;

export const BlankLayout = () => {
  return (
    <StyledLayout>
      <Outlet />
    </StyledLayout>
  );
};
