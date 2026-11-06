import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { CodeEditor } from 'twenty-ui/input';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  margin-top: ${odelzaThemeCssVariables.spacing[4]};
`;

const StyledLabel = styled.span`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
`;

const StyledHint = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
`;

export const SettingsLogicFunctionTriggerPayloadFormat = ({
  payload,
  hint,
}: {
  payload: object;
  hint?: string;
}) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <StyledLabel>{t`Sample input`}</StyledLabel>
      <CodeEditor
        value={JSON.stringify(payload, null, 2)}
        language="json"
        height={140}
        options={{ readOnly: true }}
      />
      {hint !== undefined && <StyledHint>{hint}</StyledHint>}
    </StyledContainer>
  );
};
