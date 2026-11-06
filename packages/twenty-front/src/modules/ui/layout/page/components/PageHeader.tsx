import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';

import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { AnimatePresence } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, IconX } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { LightIconButton } from 'twenty-ui/input';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledTopBarContainer = styled.div<{ isMobile: boolean }>`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.noisy};
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  font-size: ${odelzaThemeCssVariables.font.size.lg};
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: space-between;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding-bottom: ${odelzaThemeCssVariables.spacing[3]};
  padding-left: ${({ isMobile }) =>
    isMobile
      ? odelzaThemeCssVariables.spacing[3]
      : odelzaThemeCssVariables.spacing[4]};
  padding-right: ${odelzaThemeCssVariables.spacing[3]};
  padding-top: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 1 auto;
  flex-direction: row;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  min-width: 0;
  overflow-x: hidden;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${odelzaThemeCssVariables.spacing[1]};
  }
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  margin-right: ${odelzaThemeCssVariables.spacing[1]};
  overflow: hidden;
  width: 100%;
`;

const StyledTopBarIconStyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  overflow: hidden;
  width: 100%;
`;

const StyledPageActionContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 0;
  gap: ${odelzaThemeCssVariables.spacing[2]};

  justify-content: flex-end;
  min-width: 0;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

type PageHeaderProps = {
  title?: ReactNode;
  hasClosePageButton?: boolean;
  onClosePage?: () => void;
  Icon?: IconComponent;
  children?: ReactNode;
  className?: string;
};

export const PageHeader = ({
  title,
  hasClosePageButton,
  onClosePage,
  Icon,
  children,
  className,
}: PageHeaderProps) => {
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const { theme } = useContext(ThemeContext);
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();

  return (
    <AnimatePresence initial={false}>
      <StyledTopBarContainer className={className} isMobile={isMobile}>
        <StyledLeftContainer>
          {!isNavigationDrawerExpanded && (!isMobile || isSettingsPage) && (
            <NavigationDrawerCollapseButton direction="right" />
          )}
          {hasClosePageButton && (
            <LightIconButton
              Icon={IconX}
              size="small"
              accent="tertiary"
              onClick={() => onClosePage?.()}
            />
          )}

          <StyledTopBarIconStyledTitleContainer>
            {Icon && (
              <StyledIconContainer>
                <Icon size={theme.icon.size.md} />
              </StyledIconContainer>
            )}
            {isDefined(title) && (
              <StyledTitleContainer data-testid="top-bar-title">
                {typeof title === 'string' ? (
                  <OverflowingTextWithTooltip text={title} />
                ) : (
                  title
                )}
              </StyledTitleContainer>
            )}
          </StyledTopBarIconStyledTitleContainer>
        </StyledLeftContainer>
        <StyledPageActionContainer
          data-click-outside-id={PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID}
        >
          {children}
        </StyledPageActionContainer>
      </StyledTopBarContainer>
    </AnimatePresence>
  );
};
