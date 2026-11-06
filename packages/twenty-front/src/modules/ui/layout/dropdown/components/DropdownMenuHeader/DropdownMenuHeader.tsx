import { styled } from '@linaria/react';
import { type ComponentProps, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeader = styled.li`
  align-items: center;
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-top-left-radius: calc(
    ${odelzaThemeCssVariables.border.radius.md} -
      ${odelzaThemeCssVariables.spacing[1]}
  );
  border-top-right-radius: calc(
    ${odelzaThemeCssVariables.border.radius.md} -
      ${odelzaThemeCssVariables.spacing[1]}
  );
  box-sizing: content-box;
  color: ${odelzaThemeCssVariables.font.color.primary};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  flex-shrink: 0;
  font-size: ${({ onClick }) =>
    onClick
      ? odelzaThemeCssVariables.font.size.sm
      : odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};

  height: ${odelzaThemeCssVariables.spacing[6]};

  padding: ${odelzaThemeCssVariables.spacing[1]};

  &:hover {
    background: ${({ onClick }) =>
      onClick ? odelzaThemeCssVariables.background.transparent.light : 'none'};
  }

  user-select: none;
`;

const StyledChildrenWrapper = styled.span`
  overflow: hidden;
  padding: 0 ${odelzaThemeCssVariables.spacing[1]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEndComponent = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: inline-flex;
  margin-left: auto;
  margin-right: 0;

  & > svg {
    height: ${odelzaThemeCssVariables.icon.size.md}px;
    width: ${odelzaThemeCssVariables.icon.size.md}px;
  }
`;

type DropdownMenuHeaderProps = ComponentProps<'li'> & {
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
  testId?: string;
  className?: string;
  StartComponent?: React.ReactNode;
  EndComponent?: React.ReactNode;
};

export const DropdownMenuHeader = ({
  children,
  StartComponent,
  onClick,
  testId,
  className,
  EndComponent,
}: DropdownMenuHeaderProps) => {
  return (
    <StyledHeader data-testid={testId} className={className} onClick={onClick}>
      {isDefined(StartComponent) && StartComponent}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
      {isDefined(EndComponent) && (
        <StyledEndComponent>{EndComponent}</StyledEndComponent>
      )}
    </StyledHeader>
  );
};
