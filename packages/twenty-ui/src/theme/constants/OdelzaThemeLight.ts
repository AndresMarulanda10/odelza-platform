import { ODELZA_PALETTE_LIGHT } from '@ui/theme/constants/OdelzaPaletteLight';
import { ODELZA_ROLES_LIGHT } from '@ui/theme/constants/OdelzaRolesLight';
import { createOdelzaTheme } from '@ui/theme/utils/createOdelzaTheme';

export const ODELZA_THEME_LIGHT = createOdelzaTheme({
  colorScheme: 'light',
  palette: ODELZA_PALETTE_LIGHT,
  roles: ODELZA_ROLES_LIGHT,
});
