import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconDotsVertical } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledLoadingIconContainer = styled.div`
  align-items: center;
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: flex;
  justify-content: center;
  padding-inline: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledLoadingIconWrapper = styled.span`
  color: ${odelzaThemeCssVariables.font.color.light};
  display: flex;
  transform: rotate(90deg);
`;

export const AiChatInitialLoadingIndicator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledLoadingIconContainer>
      <StyledLoadingIconWrapper>
        <IconDotsVertical size={theme.icon.size.xl} />
      </StyledLoadingIconWrapper>
    </StyledLoadingIconContainer>
  );
};
