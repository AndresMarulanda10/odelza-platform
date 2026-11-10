import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledSubViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const StyledSearchContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  display: flex;
  height: ${odelzaThemeCssVariables.spacing[10]};
  min-width: 0;
  padding-inline: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  box-sizing: border-box;

  outline: none;
  padding: 0;
  width: 100%;

  &::placeholder {
    color: ${odelzaThemeCssVariables.font.color.tertiary};
  }
`;

const StyledScrollableListWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  & > * {
    flex: 1;
    min-height: 0;
  }
`;

type SidePanelSubViewWithSearchProps = {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rightElement?: ReactNode;
  children?: ReactNode;
};

export const SidePanelSubViewWithSearch = ({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  searchInputProps,
  rightElement,
  children,
}: SidePanelSubViewWithSearchProps) => (
  <StyledSubViewContainer>
    <StyledSearchContainer>
      <StyledSearchInput
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        autoFocus
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...searchInputProps}
      />
      {rightElement}
    </StyledSearchContainer>
    {children != null && (
      <StyledScrollableListWrapper>{children}</StyledScrollableListWrapper>
    )}
  </StyledSubViewContainer>
);
