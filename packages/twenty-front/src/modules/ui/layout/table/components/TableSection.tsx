import { styled } from '@linaria/react';
import { type ReactNode, useContext, useState } from 'react';
import { TableBody } from './TableBody';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { Label } from 'twenty-ui/typography';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

type TableSectionProps = {
  children: ReactNode;
  isInitiallyExpanded?: boolean;
  title: string;
};

const StyledSectionHeader = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  cursor: pointer;
  display: flex;
  height: ${odelzaThemeCssVariables.spacing[6]};
  justify-content: space-between;
  padding: 0 ${odelzaThemeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledSection = styled.div<{ isExpanded: boolean }>`
  max-height: ${({ isExpanded }) => (isExpanded ? 'fit-content' : '0')};
  opacity: ${({ isExpanded }) => (isExpanded ? 1 : 0)};
  overflow: hidden;
  transition:
    max-height calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s),
    opacity calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s);
`;

const StyledSectionContentContainer = styled.div`
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
`;

export const TableSection = ({
  children,
  isInitiallyExpanded = true,
  title,
}: TableSectionProps) => {
  const { theme } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const handleToggleSection = () =>
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);

  return (
    <>
      <StyledSectionHeader
        isExpanded={isExpanded}
        onClick={handleToggleSection}
      >
        <Label>{title}</Label>
        {isExpanded ? (
          <IconChevronUp
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.light}
          />
        ) : (
          <IconChevronDown
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.light}
          />
        )}
      </StyledSectionHeader>
      <StyledSection isExpanded={isExpanded}>
        <StyledSectionContentContainer>
          <TableBody>{children}</TableBody>
        </StyledSectionContentContainer>
      </StyledSection>
    </>
  );
};
