import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{ Variant: Variants }>`
  align-items: center;
  color: ${({ Variant }) =>
    Variant === 'danger' ? odelzaThemeCssVariables.color.red : 'inherit'};
  display: flex;
  flex-direction: row;
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledTextContainer = styled.div``;

type CustomSideMenuOptionsProps = {
  LeftIcon: IconComponent; // Any valid React node (e.g., a component)
  Variant: Variants;
  text: string;
};

type Variants = 'normal' | 'danger';

export const CustomSideMenuOptions = ({
  LeftIcon,
  Variant,
  text,
}: CustomSideMenuOptionsProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer Variant={Variant}>
      <LeftIcon
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
      ></LeftIcon>
      <StyledTextContainer>{text}</StyledTextContainer>
    </StyledContainer>
  );
};
