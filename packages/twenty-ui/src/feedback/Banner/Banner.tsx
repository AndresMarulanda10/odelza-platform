import { clsx } from 'clsx';

import styles from './Banner.module.scss';

export type BannerColor = 'primary' | 'danger';

export type BannerVariant = 'primary' | 'secondary';

const BANNER_VARIANT_COLOR_CLASS_NAMES = {
  primary: {
    primary: styles.primaryAccent,
    danger: styles.primaryDanger,
  },
  secondary: {
    primary: styles.secondaryAccent,
    danger: styles.secondaryDanger,
  },
} as const;

type BannerProps = {
  color?: BannerColor;
  variant?: BannerVariant;
  className?: string;
  children: React.ReactNode;
};

export const Banner = ({
  color = 'primary',
  variant = 'primary',
  className,
  children,
}: BannerProps) => {
  return (
    <div
      className={clsx(
        styles.banner,
        BANNER_VARIANT_COLOR_CLASS_NAMES[variant][color],
        className,
      )}
    >
      {children}
    </div>
  );
};
