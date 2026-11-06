import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

type WidgetCardContentStyledProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
  isInVerticalListTab: boolean;
  isMobile: boolean;
};

const StyledWidgetCardContent = styled.div<WidgetCardContentStyledProps>`
  background-color: ${({ variant, isInVerticalListTab, isMobile }) =>
    variant === 'record-page' && isInVerticalListTab && !isMobile
      ? odelzaThemeCssVariables.background.secondary
      : 'transparent'};
  border: ${({ variant, isEditable }) =>
    variant === 'record-page' || (variant === 'side-column' && isEditable)
      ? `1px solid ${odelzaThemeCssVariables.border.color.medium}`
      : 'none'};
  border-radius: ${({ variant, isEditable }) =>
    variant === 'record-page' || (variant === 'side-column' && isEditable)
      ? odelzaThemeCssVariables.border.radius.md
      : '0'};
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);

  height: 100%;

  margin-top: ${({ hasHeader }) =>
    hasHeader ? odelzaThemeCssVariables.spacing[2] : '0'};

  overflow: hidden;

  padding: ${({ variant, isEditable }) => {
    if (variant === 'dashboard' || variant === 'standalone')
      return odelzaThemeCssVariables.spacing[2];
    if (
      variant === 'record-page' ||
      (variant === 'side-column' && isEditable)
    ) {
      return odelzaThemeCssVariables.spacing[2];
    }
    return '0';
  }};

  &:empty {
    border: none;
    border-radius: 0;
    margin-top: 0;
    padding: 0;
  }
`;

type WidgetCardContentProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
  isInVerticalListTab: boolean;
  isMobile: boolean;
  hasInteractiveContent?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export const WidgetCardContent = ({
  variant,
  hasHeader,
  isEditable,
  isInVerticalListTab,
  isMobile,
  hasInteractiveContent = false,
  className,
  children,
}: WidgetCardContentProps) => {
  const handleContentClick = (event: React.MouseEvent) => {
    if (!isEditable || !hasInteractiveContent) {
      return;
    }

    event.stopPropagation();
  };

  return (
    <StyledWidgetCardContent
      variant={variant}
      hasHeader={hasHeader}
      isEditable={isEditable}
      isInVerticalListTab={isInVerticalListTab}
      isMobile={isMobile}
      className={className}
      onClick={handleContentClick}
    >
      {children}
    </StyledWidgetCardContent>
  );
};
