import { styled } from '@linaria/react';
import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';
import { type ReactNode } from 'react';

const CheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div<{ $checked?: boolean }>`
  align-items: center;
  background: ${({ $checked }) =>
    $checked
      ? ODELZA_THEME_LIGHT.background.transparent.accent
      : 'transparent'};
  border: 1px solid
    ${({ $checked }) =>
      $checked
        ? ODELZA_THEME_LIGHT.border.color.accent
        : ODELZA_THEME_LIGHT.font.color.primary};
  border-radius: 3px;
  display: flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

export function TableCheckbox({
  checked,
  children,
}: {
  checked?: boolean;
  children?: ReactNode;
}) {
  return (
    <CheckboxContainer>
      <CheckboxBox $checked={checked}>{children}</CheckboxBox>
    </CheckboxContainer>
  );
}
