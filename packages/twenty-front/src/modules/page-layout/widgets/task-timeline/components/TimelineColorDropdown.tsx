import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { MenuItemSelectColor } from 'twenty-ui/navigation';
import {
  MAIN_COLOR_NAMES,
  ODELZA_THEME_DARK,
  ODELZA_THEME_LIGHT,
} from 'twenty-ui/theme';

export const TimelineColorDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  const { colorScheme } = useContext(ThemeContext);
  const [hex, setHex] = useState(value);
  // Persist hex values, not the CSS variables the theme context exposes.
  const paletteHex = (color: (typeof MAIN_COLOR_NAMES)[number]) =>
    (colorScheme === 'dark' ? ODELZA_THEME_DARK : ODELZA_THEME_LIGHT).color[
      color
    ];
  return (
    <DropdownContent>
      <DropdownMenuSearchInput
        placeholder={t`Hex color`}
        value={hex}
        onChange={(event) => {
          setHex(event.target.value);
          if (/^#[0-9a-fA-F]{6}$/.test(event.target.value))
            onChange(event.target.value);
        }}
      />
      <DropdownMenuItemsContainer>
        {MAIN_COLOR_NAMES.map((color) => (
          <MenuItemSelectColor
            key={color}
            color={color}
            selected={paletteHex(color).toLowerCase() === value.toLowerCase()}
            onClick={() => {
              const nextColor = paletteHex(color);
              if (/^#[0-9a-fA-F]{6}$/.test(nextColor)) {
                setHex(nextColor);
                onChange(nextColor);
              }
            }}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
