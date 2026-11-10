import { styled } from '@linaria/react';
import {
  MOBILE_VIEWPORT,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

type EventCardProps = {
  children: React.ReactNode;
  isOpen: boolean;
};

const StyledCardContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  max-width: 400px;
  padding: ${odelzaThemeCssVariables.spacing[2]} 0px
    ${odelzaThemeCssVariables.spacing[1]} 0px;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 300px;
  }
`;

const StyledCardInnerContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  background: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: center;
  overflow: hidden;
  padding: ${odelzaThemeCssVariables.spacing[2]};
`;

export const EventCard = ({ children, isOpen }: EventCardProps) => {
  return (
    isOpen && (
      <StyledCardContainer>
        <StyledCardInnerContainer>{children}</StyledCardInnerContainer>
      </StyledCardContainer>
    )
  );
};
