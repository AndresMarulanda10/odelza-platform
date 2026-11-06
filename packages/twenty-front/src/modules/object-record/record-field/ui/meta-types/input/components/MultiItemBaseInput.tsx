import { styled } from '@linaria/react';
import {
  forwardRef,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';

const StyledInput = styled.input<{
  withRightComponent?: boolean;
  hasError?: boolean;
  hasItem: boolean;
}>`
  background-color: ${({ hasItem }) =>
    hasItem
      ? odelzaThemeCssVariables.background.transparent.lighter
      : 'transparent'};
  background-color: transparent;
  border: ${({ hasItem, hasError }) =>
    hasItem
      ? hasError
        ? `1px solid ${odelzaThemeCssVariables.border.color.danger}`
        : `1px solid ${odelzaThemeCssVariables.border.color.medium}`
      : 'none'};
  border: none;
  border-radius: ${({ hasItem }) => (hasItem ? '4px' : '0')};
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-family: ${odelzaThemeCssVariables.font.family};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${odelzaThemeCssVariables.font.color.light};
    font-family: ${odelzaThemeCssVariables.font.family};
    font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  }

  font-size: inherit;
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  font-weight: inherit;
  height: 32px;
  outline: none;
  padding: ${odelzaThemeCssVariables.spacing[0]}
    ${odelzaThemeCssVariables.spacing[2]};
  padding-right: ${({ withRightComponent }) =>
    withRightComponent ? '32px' : '0'};
  position: relative;

  width: 100%;
`;

const StyledInputContainer = styled.div`
  background-color: transparent;
  box-sizing: border-box;
  position: relative;
  width: 100%;

  &:not(:first-of-type) {
    padding: ${odelzaThemeCssVariables.spacing[1]};
  }
`;

const StyledRightContainer = styled.div`
  position: absolute;
  right: ${odelzaThemeCssVariables.spacing[2]};
  top: 50%;
  transform: translateY(-50%);
`;

const StyledErrorDiv = styled.div`
  color: ${odelzaThemeCssVariables.color.red};
  padding: 0 ${odelzaThemeCssVariables.spacing[2]};
`;

type HTMLInputProps = InputHTMLAttributes<HTMLInputElement>;

export type MultiItemBaseInputProps = Pick<
  HTMLInputProps,
  'autoFocus' | 'className' | 'value' | 'placeholder' | 'onFocus' | 'onBlur'
> & {
  onClickOutside?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onShiftTab?: () => void;
  onTab?: () => void;
  rightComponent?: ReactNode;
  renderInput?: (props: {
    value: HTMLInputProps['value'];
    onChange: (value: string) => void;
    autoFocus: HTMLInputProps['autoFocus'];
    placeholder: HTMLInputProps['placeholder'];
    hasError?: boolean;
  }) => React.ReactNode;
  error?: string | null;
  hasError?: boolean;
  hasItem: boolean;
  onChange: (value: string) => void;
  instanceId: string;
};

export const MultiItemBaseInput = forwardRef<
  HTMLInputElement,
  MultiItemBaseInputProps
>(
  (
    {
      autoFocus,
      className,
      value,
      placeholder,
      onChange,
      onClickOutside,
      onEnter = () => {},
      onEscape = () => {},
      onShiftTab,
      onTab,
      onFocus,
      onBlur,
      rightComponent,
      renderInput,
      error = '',
      hasError = false,
      hasItem,
      instanceId,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = useCombinedRefs(ref, inputRef);

    useRegisterInputEvents({
      focusId: instanceId,
      inputRef,
      inputValue: value,
      onEnter,
      onEscape,
      onClickOutside,
      onTab,
      onShiftTab,
    });

    return (
      <>
        <StyledInputContainer className={className}>
          {renderInput ? (
            renderInput({
              value,
              onChange,
              autoFocus,
              placeholder,
              hasError,
            })
          ) : (
            <StyledInput
              hasError={hasError}
              autoFocus={autoFocus}
              value={value}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              ref={combinedRef}
              withRightComponent={isDefined(rightComponent)}
              hasItem={hasItem}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          )}
          {isDefined(rightComponent) && (
            <StyledRightContainer>{rightComponent}</StyledRightContainer>
          )}
        </StyledInputContainer>
        {error && <StyledErrorDiv>{error}</StyledErrorDiv>}
      </>
    );
  },
);
