import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const getIconColorForObjectType = (objectType: string): string => {
  switch (objectType) {
    case 'note':
      return odelzaThemeCssVariables.color.yellow;
    case 'task':
      return odelzaThemeCssVariables.color.blue;
    default:
      return 'currentColor';
  }
};
