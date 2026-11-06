/* oxlint-disable twenty/no-hardcoded-colors */

// Odelza light palette (docs/brand/odelza-paleta-web.png). Email clients do
// not support CSS variables, so the values are written out here.
const odelzaPalette = {
  coffeeBean: '#2D120D',
  bloodRed: '#6B0B0C',
  butter: '#FEEFB8',
  textSecondary: '#5C463F',
  textTertiary: '#7C6A62',
  borderSubtle: '#E4DDD2',
  surfaceAlt: '#FEF6D8',
};

export const emailTheme = {
  font: {
    colors: {
      highlighted: odelzaPalette.coffeeBean,
      primary: odelzaPalette.textSecondary,
      tertiary: odelzaPalette.textTertiary,
      inverted: odelzaPalette.butter,
      link: odelzaPalette.bloodRed,
    },
    family: 'Trebuchet MS', // Google Inter not working, we need to use a web safe font, see https://templates.mailchimp.com/design/typography/
    weight: {
      regular: 400,
      bold: 600,
    },
    size: {
      sm: '12px',
      md: '13px',
      lg: '16px',
      xl: '24px',
    },
    lineHeight: '20px',
  },
  border: {
    radius: { sm: '4px', md: '8px' },
    color: { highlighted: odelzaPalette.borderSubtle },
  },
  background: {
    colors: { highlight: odelzaPalette.surfaceAlt },
    button: odelzaPalette.bloodRed,
    transparent: {
      medium: 'rgba(45, 18, 13, 0.08)',
      light: 'rgba(45, 18, 13, 0.04)',
    },
  },
};
