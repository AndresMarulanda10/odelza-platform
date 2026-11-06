import { type ThemeColor } from '@ui/theme';
import { odelzaThemeCssVariables } from '@ui/theme-constants';

import styles from './Loader.module.scss';

type LoaderProps = {
  color?: ThemeColor;
};

export const Loader = ({ color }: LoaderProps) => {
  return (
    <div
      className={styles.container}
      style={
        color
          ? ({
              '--loader-color': odelzaThemeCssVariables.tag.text[color],
            } as React.CSSProperties)
          : undefined
      }
    >
      <div className={styles.dot} />
    </div>
  );
};
