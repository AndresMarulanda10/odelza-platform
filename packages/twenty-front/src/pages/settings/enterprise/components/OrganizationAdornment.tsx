import { t } from '@lingui/core/macro';
import { css, cx } from '@linaria/core';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const pillClassName = css`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.pill};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  corner-shape: round;
  display: inline-flex;
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  padding: ${odelzaThemeCssVariables.spacing[1]}
    ${odelzaThemeCssVariables.spacing[2]};
`;

const pillLinkClassName = css`
  text-decoration: none;

  &:hover {
    background: ${odelzaThemeCssVariables.background.transparent.lighter};
    color: ${odelzaThemeCssVariables.font.color.secondary};
  }
`;

const OrganizationAdornmentContent = () => (
  <>
    <IconLock size={12} />
    {t`Organization`}
  </>
);

export const OrganizationAdornment = () => {
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  if (isBillingEnabled) {
    return (
      <Link
        className={cx(pillClassName, pillLinkClassName)}
        to={getSettingsPath(SettingsPath.BillingPlans)}
      >
        <OrganizationAdornmentContent />
      </Link>
    );
  }

  return (
    <span className={pillClassName}>
      <OrganizationAdornmentContent />
    </span>
  );
};
