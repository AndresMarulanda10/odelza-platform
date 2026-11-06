import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { styled } from '@linaria/react';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { Avatar, type AvatarSize } from 'twenty-ui/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type AppChipProps = {
  size?: AvatarSize;
  applicationId?: string | null;
  fallbackApplicationData?: {
    logo?: string | null;
    name?: string | null;
  };
  className?: string;
  chipOnly?: boolean;
};

const StyledContainer = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

export const AppChip = ({
  applicationId,
  size = 'sm',
  fallbackApplicationData,
  className,
  chipOnly = false,
}: AppChipProps) => {
  const { applicationChipData } = useApplicationChipData({
    applicationId,
    fallbackApplicationData,
  });

  return (
    <StyledContainer className={className}>
      <Avatar
        type="app"
        size={size}
        avatarUrl={getAbsoluteImageUrl(applicationChipData.logo)}
        placeholder={applicationChipData.name}
        placeholderColorSeed={applicationChipData.seed}
        color={applicationChipData.colors?.color}
        backgroundColor={applicationChipData.colors?.backgroundColor}
        borderColor={applicationChipData.colors?.borderColor}
      />
      {!chipOnly && (
        <OverflowingTextWithTooltip text={applicationChipData.name} />
      )}
    </StyledContainer>
  );
};
