import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/icon';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const PRIVACY_NOTE_ICON_SIZE = 12;

const StyledNote = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledNoteText = styled.span`
  line-height: 1.4;
`;

export const OnboardingImportPrivacyNote = () => {
  const { t } = useLingui();

  return (
    <StyledNote>
      <IconLock
        size={PRIVACY_NOTE_ICON_SIZE}
        color={odelzaThemeCssVariables.font.color.tertiary}
      />
      <StyledNoteText>
        {t`Only you will be able to see your emails and events`}
      </StyledNoteText>
    </StyledNote>
  );
};
