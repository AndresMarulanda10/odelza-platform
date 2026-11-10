import { styled } from '@linaria/react';
import { useContext } from 'react';
import { CardContent } from 'twenty-ui/surfaces';
import { type IconComponent } from 'twenty-ui/icon';
import { Radio } from 'twenty-ui/input';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledRadioCardContentContainer = styled.div`
  > * {
    align-items: center;
    border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
    border-radius: ${odelzaThemeCssVariables.border.radius.sm};
    cursor: pointer;
    display: flex;
    flex-grow: 1;
    gap: ${odelzaThemeCssVariables.spacing[2]};
    padding: ${odelzaThemeCssVariables.spacing[2]};

    &:hover {
      background: ${odelzaThemeCssVariables.background.transparent.lighter};
    }
  }
`;

const StyledRadioContainer = styled.span`
  align-items: center;
  display: flex;
  margin-left: auto;
  padding: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledDescription = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  line-height: ${odelzaThemeCssVariables.text.lineHeight.lg};
`;

type SettingsRadioCardProps = {
  value: string;
  handleSelect: (value: string) => void;
  isSelected: boolean;
  title: string;
  description?: string;
  Icon?: IconComponent;
  role?: string;
  ariaChecked?: boolean;
};

export const SettingsRadioCard = ({
  value,
  handleSelect,
  title,
  description,
  isSelected,
  Icon,
}: SettingsRadioCardProps) => {
  const { theme } = useContext(ThemeContext);
  const onClick = () => handleSelect(value);

  return (
    <StyledRadioCardContentContainer>
      <CardContent tabIndex={0} onClick={onClick}>
        {Icon && <Icon size={theme.icon.size.xl} color={theme.color.gray10} />}
        <span>
          {title && <StyledTitle>{title}</StyledTitle>}
          {description && <StyledDescription>{description}</StyledDescription>}
        </span>
        <StyledRadioContainer>
          <Radio value={value} checked={isSelected} />
        </StyledRadioContainer>
      </CardContent>
    </StyledRadioCardContentContainer>
  );
};
