import { agentChatIsScrolledToBottomSelector } from '@/ai/states/selectors/agentChatIsScrolledToBottomSelector';
import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { IconArrowDown } from 'twenty-ui/icon';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledScrollToBottomButton = styled.button<{ isVisible: boolean }>`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.rounded};
  bottom: ${odelzaThemeCssVariables.spacing[3]};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.light};
  color: ${odelzaThemeCssVariables.font.color.secondary};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  left: 50%;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  position: absolute;
  transform: translateX(-50%);
  transition:
    opacity calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s) ease,
    background calc(${odelzaThemeCssVariables.animation.duration.fast} * 1s)
      ease;
  width: 32px;
  z-index: 1;

  &:hover {
    background: ${odelzaThemeCssVariables.background.tertiary};
  }
`;

export const AiChatScrollToBottomButton = () => {
  const agentChatIsScrolledToBottom = useAtomStateValue(
    agentChatIsScrolledToBottomSelector,
  );

  return (
    <StyledScrollToBottomButton
      isVisible={!agentChatIsScrolledToBottom}
      onClick={scrollAiChatToBottom}
    >
      <IconArrowDown size={16} />
    </StyledScrollToBottomButton>
  );
};
