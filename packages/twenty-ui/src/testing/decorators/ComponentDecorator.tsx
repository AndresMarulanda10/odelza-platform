import { type Decorator } from '@storybook/react-vite';

import { odelzaThemeCssVariables } from '@ui/theme-constants';

import { ComponentStorybookLayout } from '../ComponentStorybookLayout';

const getBackgroundColor = (
  inverted: boolean,
  accent: string,
): string | undefined => {
  if (!inverted) return undefined;

  switch (accent) {
    case 'default':
      return odelzaThemeCssVariables.grayScale.gray11;
    case 'danger':
      return odelzaThemeCssVariables.color.red;
    case 'blue':
      return odelzaThemeCssVariables.color.primary;
    default:
      return undefined;
  }
};

export const ComponentDecorator: Decorator = (Story, context) => {
  const { container } = context.parameters;
  const inverted = context.args.inverted as boolean;
  const accent = context.args.accent as string;
  const backgroundColor = getBackgroundColor(inverted, accent);

  return (
    <ComponentStorybookLayout
      width={container?.width}
      height={container?.height}
      backgroundColor={backgroundColor}
    >
      <Story />
    </ComponentStorybookLayout>
  );
};
