import { type Preview } from '@storybook/react-vite';
import '@ui/theme-constants/odelza-theme-light.css';
import '@ui/theme-constants/odelza-theme-dark.css';
import { ThemeProvider } from '@ui/theme-constants';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    a11y: {
      test: 'error',
    },
  },
  globalTypes: {
    colorScheme: {
      description: 'Odelza color scheme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorScheme: 'light',
  },
  decorators: [
    (Story, context) => {
      const colorScheme =
        context.globals.colorScheme === 'dark' ? 'dark' : 'light';

      return (
        <ThemeProvider key={colorScheme} colorScheme={colorScheme}>
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
