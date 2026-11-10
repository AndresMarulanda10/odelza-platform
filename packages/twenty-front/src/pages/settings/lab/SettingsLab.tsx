import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

export const SettingsLab = () => (
  <SettingsPageLayout
    title={t`Beta features`}
    links={[
      {
        children: t`Other`,
        href: getSettingsPath(SettingsPath.Lab),
      },
      { children: t`Beta features` },
    ]}
  >
    <SettingsPageContainer>
      <Section>
        <H2Title
          title={t`Features`}
          description={t`Try our upcoming features. Note they are still in beta. Please bear with us and report any issues you find.`}
        />
        <SettingsLabContent />
      </Section>
    </SettingsPageContainer>
  </SettingsPageLayout>
);
