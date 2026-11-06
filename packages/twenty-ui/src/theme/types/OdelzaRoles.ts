export type OdelzaNeutralScale = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export type OdelzaRoles = {
  backgroundPage: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  surfaceActive: string;
  selection: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textPlaceholder: string;
  textDisabled: string;
  borderSubtle: string;
  borderLight: string;
  borderMedium: string;
  borderStrong: string;
  navBackground: string;
  navText: string;
  navTextMuted: string;
  navItemHover: string;
  navItemActive: string;
  primary: string;
  primaryHover: string;
  primaryPressed: string;
  onPrimary: string;
  secondary: string;
  secondaryHover: string;
  secondaryPressed: string;
  onSecondary: string;
  focus: string;
  invertedBackground: string;
  invertedBackgroundHover: string;
  invertedText: string;
  overlay: string;
  shadow: string;
  neutralScale: OdelzaNeutralScale;
};
