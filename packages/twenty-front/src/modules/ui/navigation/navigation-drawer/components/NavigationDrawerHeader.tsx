import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import {
  MOBILE_VIEWPORT,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div<{ isExpanded: boolean }>`
  align-items: ${({ isExpanded }) => (isExpanded ? 'center' : 'flex-start')};
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  flex-shrink: 0;
  gap: ${({ isExpanded }) =>
    isExpanded ? '0' : odelzaThemeCssVariables.spacing[4]};
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding-right: ${odelzaThemeCssVariables.spacing[2]};
  transition: gap
    calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s) ease;
  user-select: none;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${odelzaThemeCssVariables.spacing[5]};
    padding-right: ${odelzaThemeCssVariables.spacing[5]};
  }
`;

const StyledRightActions = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  align-self: ${({ isExpanded }) => (isExpanded ? 'auto' : 'flex-end')};
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  flex-shrink: 0;
  gap: ${({ isExpanded }) =>
    isExpanded ? '2px' : odelzaThemeCssVariables.spacing[1]};
  margin-left: ${({ isExpanded }) => (isExpanded ? 'auto' : '0')};
  transition: gap
    calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s) ease;
`;

const StyledNavigationDrawerCollapseButtonContainer = styled.div`
  > * {
    height: ${odelzaThemeCssVariables.spacing[6]};
    padding-right: 0;
    width: ${odelzaThemeCssVariables.spacing[6]};
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    > * {
      height: ${odelzaThemeCssVariables.spacing[8]};
      padding-right: 0;
      width: ${odelzaThemeCssVariables.spacing[8]};
    }
  }
`;

const StyledWorkspaceDropdownContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-height: ${odelzaThemeCssVariables.spacing[8]};
  min-width: 0;
`;

type NavigationDrawerHeaderProps = {
  showCollapseButton: boolean;
};

export const NavigationDrawerHeader = ({
  showCollapseButton,
}: NavigationDrawerHeaderProps) => {
  const isMobile = useIsMobile();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );

  return (
    <StyledContainer isExpanded={isNavigationDrawerExpanded}>
      <StyledWorkspaceDropdownContainer>
        <MultiWorkspaceDropdownButton />
      </StyledWorkspaceDropdownContainer>
      <StyledRightActions isExpanded={isNavigationDrawerExpanded}>
        {!isMobile && (
          <LightIconButton
            Icon={IconSearch}
            accent="secondary"
            size="small"
            onClick={openRecordsSearchPage}
            aria-label={t`Search`}
          />
        )}
        {isNavigationDrawerExpanded && showCollapseButton && (
          <StyledNavigationDrawerCollapseButtonContainer>
            <NavigationDrawerCollapseButton direction="left" />
          </StyledNavigationDrawerCollapseButtonContainer>
        )}
      </StyledRightActions>
    </StyledContainer>
  );
};
