import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { styled } from '@linaria/react';
import {
  MOBILE_VIEWPORT,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

export type NavigationDrawerItemBreadcrumbProps = {
  state?: NavigationDrawerSubItemState;
};

const StyledNavigationDrawerItemBreadcrumbContainer = styled.div`
  height: 28px;

  margin-left: 7.5px;
  margin-right: ${odelzaThemeCssVariables.spacing[2]};
  width: 9px;

  [data-dnd-dragging] & {
    display: none;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: ${odelzaThemeCssVariables.spacing[8]};
  }
`;

const StyledGapVerticalLine = styled.div<{ darker: boolean }>`
  background: ${({ darker }) =>
    darker
      ? odelzaThemeCssVariables.font.color.tertiary
      : odelzaThemeCssVariables.border.color.strong};

  height: 2px;
  position: relative;

  top: -2px;
  width: 1px;
`;

const StyledSecondaryFullVerticalBar = styled.div<{ darker: boolean }>`
  background: ${({ darker }) =>
    darker
      ? odelzaThemeCssVariables.font.color.tertiary
      : odelzaThemeCssVariables.border.color.strong};

  height: calc(${odelzaThemeCssVariables.spacing[7]} + 1px);
  position: relative;
  top: -17px;
  width: 1px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: calc(${odelzaThemeCssVariables.spacing[8]} + 1px);
  }
`;

const StyledRoundedProtrusion = styled.div<{ darker: boolean }>`
  border: 1px solid
    ${({ darker }) =>
      darker
        ? odelzaThemeCssVariables.font.color.tertiary
        : odelzaThemeCssVariables.border.color.strong};
  border-bottom-left-radius: 4px;

  border-right: none;

  border-top: none;

  height: 14px;

  position: relative;
  top: -2px;
  width: 8px;
  z-index: ${({ darker }) => (darker ? '1' : 'auto')};
`;

export const NavigationDrawerItemBreadcrumb = ({
  state,
}: NavigationDrawerItemBreadcrumbProps) => {
  const showVerticalBar =
    state !== 'last-not-selected' && state !== 'last-selected';

  const verticalBarShouldBeDarker = state === 'intermediate-before-selected';

  const protrusionShouldBeDarker =
    state === 'intermediate-selected' || state === 'last-selected';

  const gapShouldBeDarker =
    state === 'intermediate-before-selected' ||
    state === 'intermediate-selected' ||
    state === 'last-selected';

  return (
    <StyledNavigationDrawerItemBreadcrumbContainer>
      <StyledGapVerticalLine darker={gapShouldBeDarker} />
      <StyledRoundedProtrusion darker={protrusionShouldBeDarker} />
      {showVerticalBar && (
        <StyledSecondaryFullVerticalBar darker={verticalBarShouldBeDarker} />
      )}
    </StyledNavigationDrawerItemBreadcrumbContainer>
  );
};
