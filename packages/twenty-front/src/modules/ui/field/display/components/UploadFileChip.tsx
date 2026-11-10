import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconArrowUp } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/feedback';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.transparent.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.smRound};
  corner-shape: round;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[5]};
  margin-right: ${odelzaThemeCssVariables.spacing[1]};
  padding: 0 ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledIconBox = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.font.color.tertiary};
  border-radius: ${odelzaThemeCssVariables.border.radius.smRound};
  color: ${odelzaThemeCssVariables.background.primary};
  corner-shape: round;
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const StyledStaticLoader = styled.div`
  align-items: center;
  border: 1px solid ${odelzaThemeCssVariables.font.color.tertiary};
  border-radius: ${odelzaThemeCssVariables.border.radius.pill};
  box-sizing: border-box;
  corner-shape: round;
  display: flex;
  height: 12px;
  justify-content: center;
  width: 24px;
`;

type UploadFileChipProps = {
  isLoading?: boolean;
};

export const UploadFileChip = ({ isLoading = true }: UploadFileChipProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <StyledIconBox>
        <IconArrowUp size={theme.icon.size.sm} />
      </StyledIconBox>
      {isLoading ? <Loader /> : <StyledStaticLoader />}
    </StyledContainer>
  );
};
