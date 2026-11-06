import { type ApplicationDisplayData } from '@/applications/types/applicationDisplayData.type';
import { AppChip } from '@/applications/components/AppChip';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

type ApplicationDisplayProps = {
  application?: ApplicationDisplayData;
};

const StyledAppChip = styled(AppChip)`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

export const ApplicationDisplay = ({
  application,
}: ApplicationDisplayProps) => {
  return (
    <StyledAppChip
      size="md"
      applicationId={application?.id}
      fallbackApplicationData={{
        logo: application?.logo,
        name: application?.name,
      }}
    />
  );
};
