import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledThreadMessage = styled.div<{ hideBottomBorder?: boolean }>`
  border-bottom: ${({ hideBottomBorder }) =>
    hideBottomBorder
      ? 'none'
      : `1px solid ${odelzaThemeCssVariables.border.color.light}`};
  display: flex;
  flex-direction: column;
  padding: ${odelzaThemeCssVariables.spacing[4]}
    ${odelzaThemeCssVariables.spacing[0]};
`;

const StyledHeader = styled.div<{ isClickable?: boolean }>`
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'auto')};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[0]}
    ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledBody = styled.div`
  padding: ${odelzaThemeCssVariables.spacing[0]}
    ${odelzaThemeCssVariables.spacing[2]};
`;

type EmailThreadMessageLayoutProps = {
  header: ReactNode;
  children: ReactNode;
  hideBottomBorder?: boolean;
  isRowClickable?: boolean;
  isHeaderClickable?: boolean;
  onRowClick?: () => void;
  onHeaderClick?: () => void;
};

export const EmailThreadMessageLayout = ({
  header,
  children,
  hideBottomBorder = false,
  isRowClickable = false,
  isHeaderClickable = false,
  onRowClick,
  onHeaderClick,
}: EmailThreadMessageLayoutProps) => (
  <StyledThreadMessage
    hideBottomBorder={hideBottomBorder}
    onClick={onRowClick}
    style={{ cursor: isRowClickable ? 'pointer' : 'auto' }}
  >
    <StyledHeader isClickable={isHeaderClickable} onClick={onHeaderClick}>
      {header}
    </StyledHeader>
    <StyledBody>{children}</StyledBody>
  </StyledThreadMessage>
);
