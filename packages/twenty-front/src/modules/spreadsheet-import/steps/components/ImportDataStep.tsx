import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { spreadsheetImportCreatedRecordsProgressState } from '@/spreadsheet-import/states/spreadsheetImportCreatedRecordsProgressState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ModalContent } from 'twenty-ui/surfaces';
import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { t } from '@lingui/core/macro';
import { Loader } from 'twenty-ui/feedback';

const StyledHeader = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  margin-bottom: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledDescription = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  margin-bottom: ${odelzaThemeCssVariables.spacing[5]};
`;

type ImportDataStepProps = {
  recordsToImportCount: number;
};

export const ImportDataStep = ({
  recordsToImportCount,
}: ImportDataStepProps) => {
  const { onClose } = useSpreadsheetImportInternal();
  const spreadsheetImportCreatedRecordsProgress = useAtomStateValue(
    spreadsheetImportCreatedRecordsProgressState,
  );
  const { formatNumber } = useNumberFormat();

  const formattedCreatedRecordsProgress = formatNumber(
    spreadsheetImportCreatedRecordsProgress,
  );
  const formattedRecordsToImportCount = formatNumber(recordsToImportCount);

  return (
    <>
      <ModalContent noPadding isVerticallyCentered isHorizontallyCentered>
        <StyledHeader>{t`Importing Data ...`}</StyledHeader>
        <StyledDescription>{t`${formattedCreatedRecordsProgress} out of ${formattedRecordsToImportCount} records imported.`}</StyledDescription>
        <Loader />
      </ModalContent>
      <StepNavigationButton onBack={onClose} backTitle={t`Cancel`} />
    </>
  );
};
