import { clsx } from 'clsx';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Pill } from '@ui/data-display/Pill/Pill';
import { odelzaThemeCssVariables, useTheme } from '@ui/theme-constants';
import { useIsMobile } from '@ui/utilities';
import { getOsShortcutSeparator } from '@ui/utilities/device/getOsShortcutSeparator';
import {
  type ButtonAccent,
  type ButtonPosition,
  type ButtonProps,
  type ButtonVariant,
} from '@ui/input/Button/Button';

import styles from './AnimatedButton.module.scss';

export type AnimatedButtonProps = ButtonProps & {
  animatedSvg: React.ReactNode;
  soonLabel?: string;
  // Renders a square icon-only button (width matches the size-based height).
  square?: boolean;
};

type AnimatedButtonDynamicStyles = {
  background: string;
  borderColor: string;
  borderWidthOverride: string;
  boxShadow: string;
  color: string;
  hoverBackground: string;
  activeBackground: string;
};

const computeAnimatedButtonDynamicStyles = (
  variant: ButtonVariant,
  inverted: boolean,
  accent: ButtonAccent,
  disabled: boolean,
  focus: boolean,
  position: ButtonPosition,
): AnimatedButtonDynamicStyles => {
  const result: AnimatedButtonDynamicStyles = {
    background: 'transparent',
    borderColor: 'transparent',
    borderWidthOverride: '',
    boxShadow: 'none',
    color: odelzaThemeCssVariables.font.color.secondary,
    hoverBackground: 'transparent',
    activeBackground: 'transparent',
  };

  switch (variant) {
    case 'primary':
      switch (accent) {
        case 'default':
          result.background = !inverted
            ? odelzaThemeCssVariables.background.secondary
            : odelzaThemeCssVariables.background.primary;
          result.borderColor = !inverted
            ? !disabled && focus
              ? odelzaThemeCssVariables.color.primary
              : odelzaThemeCssVariables.background.transparent.light
            : odelzaThemeCssVariables.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? odelzaThemeCssVariables.accent.tertiary
                    : odelzaThemeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? odelzaThemeCssVariables.font.color.secondary
              : odelzaThemeCssVariables.font.color.extraLight
            : odelzaThemeCssVariables.font.color.secondary;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? odelzaThemeCssVariables.background.tertiary
              : odelzaThemeCssVariables.background.secondary;
            result.activeBackground = !inverted
              ? odelzaThemeCssVariables.background.quaternary
              : odelzaThemeCssVariables.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'primary':
          result.background = !inverted
            ? odelzaThemeCssVariables.color.primary
            : odelzaThemeCssVariables.background.primary;
          result.borderColor = !inverted
            ? focus
              ? odelzaThemeCssVariables.color.primary
              : odelzaThemeCssVariables.background.transparent.light
            : odelzaThemeCssVariables.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? odelzaThemeCssVariables.accent.tertiary
                    : odelzaThemeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? odelzaThemeCssVariables.buttons.onPrimary
            : odelzaThemeCssVariables.color.primary;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? odelzaThemeCssVariables.color.primary10
              : odelzaThemeCssVariables.background.secondary;
            result.activeBackground = !inverted
              ? odelzaThemeCssVariables.color.primary12
              : odelzaThemeCssVariables.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'danger':
          result.background = !inverted
            ? odelzaThemeCssVariables.color.red
            : odelzaThemeCssVariables.background.primary;
          result.borderColor = !inverted
            ? focus
              ? odelzaThemeCssVariables.color.red
              : odelzaThemeCssVariables.background.transparent.light
            : odelzaThemeCssVariables.background.transparent.light;
          result.borderWidthOverride = '1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? odelzaThemeCssVariables.color.red3
                    : odelzaThemeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? odelzaThemeCssVariables.background.primary
            : odelzaThemeCssVariables.color.red;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? odelzaThemeCssVariables.color.red8
              : odelzaThemeCssVariables.background.secondary;
            result.activeBackground = !inverted
              ? odelzaThemeCssVariables.color.red10
              : odelzaThemeCssVariables.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
      }
      break;
    case 'secondary':
    case 'tertiary':
      switch (accent) {
        case 'default':
          result.background = 'transparent';
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? !disabled && focus
                ? odelzaThemeCssVariables.color.primary
                : odelzaThemeCssVariables.background.transparent.medium
              : focus
                ? odelzaThemeCssVariables.color.primary
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? odelzaThemeCssVariables.buttons.onPrimary
                : odelzaThemeCssVariables.background.transparent.primary
              : focus
                ? odelzaThemeCssVariables.buttons.onPrimary
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? odelzaThemeCssVariables.accent.tertiary
                    : odelzaThemeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? odelzaThemeCssVariables.font.color.secondary
              : odelzaThemeCssVariables.font.color.extraLight
            : odelzaThemeCssVariables.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? odelzaThemeCssVariables.background.transparent.light
              : 'transparent'
            : odelzaThemeCssVariables.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? odelzaThemeCssVariables.background.transparent.light
              : 'transparent'
            : odelzaThemeCssVariables.background.transparent.medium;
          break;
        case 'primary':
          result.background = 'transparent';
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? focus
                ? odelzaThemeCssVariables.color.primary
                : odelzaThemeCssVariables.accent.primary
              : focus
                ? odelzaThemeCssVariables.color.primary
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? odelzaThemeCssVariables.buttons.onPrimary
                : odelzaThemeCssVariables.background.transparent.primary
              : focus
                ? odelzaThemeCssVariables.buttons.onPrimary
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? odelzaThemeCssVariables.accent.tertiary
                    : odelzaThemeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? odelzaThemeCssVariables.color.primary
              : odelzaThemeCssVariables.accent.accent4060
            : odelzaThemeCssVariables.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? odelzaThemeCssVariables.accent.tertiary
              : 'transparent'
            : odelzaThemeCssVariables.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? odelzaThemeCssVariables.accent.secondary
              : 'transparent'
            : odelzaThemeCssVariables.background.transparent.medium;
          break;
        case 'danger':
          result.background = 'transparent';
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? focus
                ? odelzaThemeCssVariables.color.red
                : odelzaThemeCssVariables.border.color.danger
              : focus
                ? odelzaThemeCssVariables.color.red
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? odelzaThemeCssVariables.buttons.onPrimary
                : odelzaThemeCssVariables.background.transparent.primary
              : focus
                ? odelzaThemeCssVariables.buttons.onPrimary
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? odelzaThemeCssVariables.color.red3
                    : odelzaThemeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? odelzaThemeCssVariables.font.color.danger
            : odelzaThemeCssVariables.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? odelzaThemeCssVariables.background.danger
              : 'transparent'
            : odelzaThemeCssVariables.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? odelzaThemeCssVariables.background.danger
              : 'transparent'
            : odelzaThemeCssVariables.background.transparent.medium;
          break;
      }
      break;
  }

  if (result.borderWidthOverride !== '' && position !== 'standalone') {
    switch (position) {
      case 'left':
        result.borderWidthOverride = '1px 0px 1px 1px';
        break;
      case 'middle':
        result.borderWidthOverride = '1px 0px 1px 0px';
        break;
      case 'right':
        result.borderWidthOverride = '1px 1px 1px 0px';
        break;
    }
  }

  return result;
};

export const AnimatedButton = ({
  className,
  Icon,
  animatedSvg,
  title,
  fullWidth = false,
  variant = 'primary',
  inverted = false,
  size = 'medium',
  accent = 'default',
  square = false,
  position = 'standalone',
  soon = false,
  disabled = false,
  justify = 'flex-start',
  focus = false,
  onClick,
  to,
  target,
  dataTestId,
  hotkeys,
  ariaLabel,
  dataClickOutsideId,
  dataGloballyPreventClickOutside,
  soonLabel = 'Soon',
}: AnimatedButtonProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isDisabled = soon || disabled;

  const dynamicStyles = useMemo(() => {
    const computedStyles = computeAnimatedButtonDynamicStyles(
      variant,
      inverted,
      accent,
      isDisabled,
      focus,
      position,
    );
    return {
      '--abtn-bg': computedStyles.background,
      '--abtn-border-color': computedStyles.borderColor,
      '--abtn-border-width': computedStyles.borderWidthOverride || undefined,
      '--abtn-box-shadow': computedStyles.boxShadow,
      '--abtn-color': computedStyles.color,
      '--abtn-hover-bg': computedStyles.hoverBackground,
      '--abtn-active-bg': computedStyles.activeBackground,
    } as React.CSSProperties;
  }, [variant, inverted, accent, isDisabled, focus, position]);

  // Replaces the legacy Linaria `as` polymorphism: react-router Link when a
  // `to` is provided, a native button otherwise. Typed as any to forward all
  // props untyped, exactly like the legacy `as` prop did.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ButtonComponent: any = to ? Link : 'button';

  return (
    <ButtonComponent
      className={clsx(
        styles.button,
        styles[size],
        square && styles.square,
        fullWidth && styles.fullWidth,
        className,
      )}
      data-position={position}
      data-disabled={isDisabled || undefined}
      disabled={isDisabled}
      style={
        {
          ...dynamicStyles,
          '--abtn-justify': justify,
        } as React.CSSProperties
      }
      onClick={onClick}
      to={to}
      target={target}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      data-click-outside-id={dataClickOutsideId}
      data-globally-prevent-click-outside={dataGloballyPreventClickOutside}
    >
      {Icon && (
        <div className={styles.motion}>
          <Icon size={theme.icon.size.sm} aria-hidden />
        </div>
      )}
      {animatedSvg && <div className={styles.motion}>{animatedSvg}</div>}
      {title}
      {hotkeys && !isMobile && (
        <>
          <div
            className={styles.separator}
            data-size={size}
            data-accent={accent}
          />
          <div
            className={styles.shortcutLabel}
            data-variant={variant}
            data-accent={accent}
          >
            {hotkeys.join(getOsShortcutSeparator())}
          </div>
        </>
      )}
      {soon && (
        <span className={styles.soonPillContainer}>
          <Pill label={soonLabel} />
        </span>
      )}
    </ButtonComponent>
  );
};
