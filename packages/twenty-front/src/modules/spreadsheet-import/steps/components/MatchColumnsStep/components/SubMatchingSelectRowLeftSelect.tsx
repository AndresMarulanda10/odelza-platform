import { SubMatchingSelectControlContainer } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectControlContainer';

import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledLabel = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

export type SubMatchingSelectRowLeftSelectProps = {
  option: SpreadsheetMatchedOptions | Partial<SpreadsheetMatchedOptions>;
};

export const SubMatchingSelectRowLeftSelect = ({
  option,
}: SubMatchingSelectRowLeftSelectProps) => {
  return (
    <SubMatchingSelectControlContainer cursor="default">
      <StyledControlLabel>
        <StyledLabel>{option.entry}</StyledLabel>
      </StyledControlLabel>
    </SubMatchingSelectControlContainer>
  );
};
