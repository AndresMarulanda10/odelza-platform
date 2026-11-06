import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { styled } from '@linaria/react';
import { useId } from 'react';
import { Toggle } from 'twenty-ui/input';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type FormBooleanFieldToggleInputProps = {
  label?: string;
  description: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

const StyledDescription = styled.span`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.md};
  overflow: hidden;
  padding-left: ${odelzaThemeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledToggleContainer = styled.div`
  background-color: ${odelzaThemeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-bottom-right-radius: ${odelzaThemeCssVariables.border.radius.md};
  border-right: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-top: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-top-right-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: flex;
  padding-bottom: ${odelzaThemeCssVariables.spacing[2]};
  padding-right: ${odelzaThemeCssVariables.spacing[2]};
  padding-top: ${odelzaThemeCssVariables.spacing[2]};
`;

export const FormBooleanFieldToggleInput = ({
  label,
  description,
  hint,
  value,
  onChange,
  disabled,
}: FormBooleanFieldToggleInputProps) => {
  const instanceId = useId();

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement
          preventFocusStackUpdate
        >
          <StyledDescription>{description}</StyledDescription>
        </FormFieldInputInnerContainer>

        <StyledToggleContainer>
          <Toggle
            value={value}
            onChange={onChange}
            disabled={disabled}
            toggleSize="small"
          />
        </StyledToggleContainer>
      </FormFieldInputRowContainer>

      {hint && <InputHint>{hint}</InputHint>}
    </FormFieldInputContainer>
  );
};
