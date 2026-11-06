import { styled } from '@linaria/react';
import { useContext } from 'react';

import { IconGripVertical } from 'twenty-ui/icon';
import { Label } from 'twenty-ui/typography';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  /* Height below is sized against the content box. */
  box-sizing: content-box;
  cursor: grab;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  height: calc(32px - 2 * ${odelzaThemeCssVariables.spacing[2]});
  padding: ${odelzaThemeCssVariables.spacing[2]}
    ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledIconContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding: ${odelzaThemeCssVariables.spacing[1]};
`;

type FieldsConfigurationGroupDraggableHeaderProps = {
  text: string;
};

export const FieldsConfigurationGroupDraggableHeader = ({
  text,
}: FieldsConfigurationGroupDraggableHeaderProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <StyledIconContainer>
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={odelzaThemeCssVariables.font.color.tertiary}
        />
      </StyledIconContainer>
      <Label>{text}</Label>
    </StyledContainer>
  );
};
