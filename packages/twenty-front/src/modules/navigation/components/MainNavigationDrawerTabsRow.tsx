import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  type IconComponent,
  IconComment,
  IconHome,
  IconMessageCirclePlus,
} from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { useContext } from 'react';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledRow = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  gap: ${({ isExpanded }) =>
    isExpanded ? odelzaThemeCssVariables.spacing[2] : 0};
  justify-content: ${({ isExpanded }) =>
    isExpanded ? 'space-between' : 'center'};
  transition: gap
    calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ isExpanded }) => (isExpanded ? '100%' : 'max-content')};
`;

const StyledTabsPill = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.pill};
  box-sizing: border-box;
  corner-shape: round;
  display: flex;
  flex-shrink: 0;
  gap: ${odelzaThemeCssVariables.spacing[0.5]};
  height: ${odelzaThemeCssVariables.spacing[7]};
  padding: 3px;
  width: ${odelzaThemeCssVariables.spacing[18]};
`;

const StyledTabWrapper = styled.div<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${odelzaThemeCssVariables.border.radius.pill};
  color: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.font.color.primary
      : odelzaThemeCssVariables.font.color.tertiary};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;

  &:hover {
    background: ${({ isActive }) =>
      isActive
        ? odelzaThemeCssVariables.background.transparent.light
        : odelzaThemeCssVariables.background.transparent.lighter};
  }
`;

const StyledTabIcon = styled.div`
  align-items: center;
  display: flex;
  height: ${odelzaThemeCssVariables.spacing[5]};
  justify-content: center;
  width: ${odelzaThemeCssVariables.spacing[5]};
`;

const StyledNewChatIcon = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  justify-content: center;
`;

const StyledNewChatButtonWrapper = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.pill};
  box-sizing: border-box;
  corner-shape: round;
  display: flex;
  height: ${({ isExpanded }) =>
    isExpanded
      ? odelzaThemeCssVariables.spacing[7]
      : odelzaThemeCssVariables.spacing[6]};
  justify-content: center;
  padding: ${({ isExpanded }) =>
    isExpanded ? '3px' : odelzaThemeCssVariables.spacing[0.5]};
  transition:
    height calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s) ease,
    padding calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ isExpanded }) =>
    isExpanded ? '103px' : odelzaThemeCssVariables.spacing[6]};
`;

const StyledNewChatButton = styled.div`
  align-items: center;
  border-radius: inherit;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: 100%;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
  padding-inline: ${odelzaThemeCssVariables.spacing[2]};
  transition:
    background calc(${odelzaThemeCssVariables.animation.duration.fast} * 1s)
      ease,
    color calc(${odelzaThemeCssVariables.animation.duration.fast} * 1s) ease;
  width: 100%;

  &:hover {
    background: ${odelzaThemeCssVariables.background.transparent.light};
    color: ${odelzaThemeCssVariables.font.color.primary};
  }
`;

type MainNavigationDrawerTabsRowProps = {
  NavigationMenuTabIcon?: IconComponent;
  navigationMenuTabLabel?: string;
};

export const MainNavigationDrawerTabsRow = ({
  NavigationMenuTabIcon = IconHome,
  navigationMenuTabLabel = t`Home`,
}: MainNavigationDrawerTabsRowProps) => {
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const [navigationDrawerActiveTab, setNavigationDrawerActiveTab] =
    useAtomState(navigationDrawerActiveTabState);
  const { switchToNewChat } = useSwitchToNewAiChat();
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const isExpanded = isNavigationDrawerExpanded || isMobile;

  if (!hasAiPermission) {
    return null;
  }

  const handleTabClick = (tab: NavigationDrawerActiveTab) => () => {
    setNavigationDrawerActiveTab(tab);
  };

  const handleTabKeyDown =
    (tab: NavigationDrawerActiveTab) => (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setNavigationDrawerActiveTab(tab);
      }
    };

  const handleNewChatClick = () => {
    if (isMobile) {
      setIsNavigationDrawerExpanded(false);
    }
    switchToNewChat();
  };

  const handleNewChatKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNewChatClick();
    }
  };

  const getTabIconColor = (isActive: boolean) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary;

  return (
    <StyledRow isExpanded={isExpanded}>
      <NavigationDrawerAnimatedCollapseWrapper>
        <StyledTabsPill role="tablist" aria-label={t`Navigation tabs`}>
          <StyledTabWrapper
            isActive={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
            }
            role="tab"
            aria-selected={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
            }
            aria-label={navigationMenuTabLabel}
            tabIndex={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
                ? 0
                : -1
            }
            onClick={handleTabClick(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU)}
            onKeyDown={handleTabKeyDown(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU)}
          >
            <StyledTabIcon>
              <NavigationMenuTabIcon
                size={theme.icon.size.md}
                color={getTabIconColor(
                  navigationDrawerActiveTab ===
                    NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
                )}
              />
            </StyledTabIcon>
          </StyledTabWrapper>
          <StyledTabWrapper
            isActive={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY
            }
            role="tab"
            aria-selected={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY
            }
            aria-label={t`Chat`}
            tabIndex={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY
                ? 0
                : -1
            }
            onClick={handleTabClick(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY)}
            onKeyDown={handleTabKeyDown(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY)}
          >
            <StyledTabIcon>
              <IconComment
                size={theme.icon.size.md}
                color={getTabIconColor(
                  navigationDrawerActiveTab ===
                    NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
                )}
              />
            </StyledTabIcon>
          </StyledTabWrapper>
        </StyledTabsPill>
      </NavigationDrawerAnimatedCollapseWrapper>
      <StyledNewChatButtonWrapper isExpanded={isExpanded}>
        <StyledNewChatButton
          role="button"
          tabIndex={0}
          aria-label={t`New chat`}
          onClick={handleNewChatClick}
          onKeyDown={handleNewChatKeyDown}
        >
          <StyledNewChatIcon>
            <IconMessageCirclePlus size={theme.icon.size.md} />
          </StyledNewChatIcon>
          {isExpanded && <OverflowingTextWithTooltip text={t`New chat`} />}
        </StyledNewChatButton>
      </StyledNewChatButtonWrapper>
    </StyledRow>
  );
};
