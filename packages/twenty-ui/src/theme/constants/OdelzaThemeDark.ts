import { ODELZA_PALETTE_DARK } from '@ui/theme/constants/OdelzaPaletteDark';
import { ODELZA_ROLES_DARK } from '@ui/theme/constants/OdelzaRolesDark';
import { createOdelzaTheme } from '@ui/theme/utils/createOdelzaTheme';

export const ODELZA_THEME_DARK = createOdelzaTheme({
  colorScheme: 'dark',
  palette: ODELZA_PALETTE_DARK,
  roles: ODELZA_ROLES_DARK,
});
