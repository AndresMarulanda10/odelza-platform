import { IMPORT_CONTACTS_PREVIEW_COMPANIES } from '@/onboarding/constants/ImportContactsPreviewCompanies';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { getLogoUrlFromDomainName } from 'twenty-shared/utils';
import {
  Avatar,
  Chip,
  ChipAccent,
  ChipSize,
  ChipVariant,
} from 'twenty-ui/data-display';
import { IconBuildingSkyscraper, IconPlus } from 'twenty-ui/icon';
import { Checkbox } from 'twenty-ui/input';
import { odelzaThemeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const PREVIEW_ROW_HEIGHT = 32;

const StyledColumn = styled.div`
  background-color: ${odelzaThemeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 1px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
`;

const StyledRow = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.primary};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${PREVIEW_ROW_HEIGHT}px;
  padding: 0 ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledHeaderTitle = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1 1 0;
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  min-width: 0;
`;

export const OnboardingImportPreviewCompanies = () => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledColumn>
      <StyledRow>
        <Checkbox checked={false} hoverable />
        <StyledHeaderTitle>
          <IconBuildingSkyscraper
            size={theme.icon.size.md}
            color={odelzaThemeCssVariables.font.color.tertiary}
          />
          {t`Companies`}
        </StyledHeaderTitle>
        <IconPlus
          size={theme.icon.size.md}
          color={odelzaThemeCssVariables.font.color.tertiary}
        />
      </StyledRow>
      {IMPORT_CONTACTS_PREVIEW_COMPANIES.map((company) => (
        <StyledRow key={company.id}>
          <Checkbox checked={false} hoverable />
          <Chip
            label={company.name}
            size={ChipSize.Small}
            variant={ChipVariant.Transparent}
            accent={ChipAccent.TextPrimary}
            clickable={false}
            leftComponent={
              <Avatar
                type="squared"
                size="md"
                placeholder={company.name}
                placeholderColorSeed={company.id}
                avatarUrl={getAbsoluteImageUrl(
                  getLogoUrlFromDomainName(company.domainName),
                )}
              />
            }
          />
        </StyledRow>
      ))}
    </StyledColumn>
  );
};
