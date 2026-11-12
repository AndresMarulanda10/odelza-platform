import { type ComponentType } from 'react';

import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';

type MiniIconProps = {
  color?: string;
  icon: ComponentType<{
    'aria-hidden'?: boolean;
    color?: string;
    size?: number;
    stroke?: number;
  }>;
  size?: number;
  stroke?: number;
};

export function MiniIcon({
  color,
  icon: Icon,
  size = ODELZA_THEME_LIGHT.icon.size.sm,
  stroke = ODELZA_THEME_LIGHT.icon.stroke.sm,
}: MiniIconProps) {
  return <Icon aria-hidden color={color} size={size} stroke={stroke} />;
}
