import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { MenuItemSelectColor } from 'twenty-ui/navigation';
import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';
import * as RadixColors from '@radix-ui/colors';

export const TimelineColorDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  const { colorScheme } = useContext(ThemeContext);
  const [hex, setHex] = useState(value);
  // Persist sRGB hex values rather than native display-P3 swatch CSS.
  const paletteHex = (color: (typeof MAIN_COLOR_NAMES)[number]) => {
    const paletteName =
      color === 'blue' ? 'indigo' : color === 'turquoise' ? 'teal' : color;
    const palette = (RadixColors as Record<string, Record<string, string>>)[
      `${paletteName}${colorScheme === 'dark' ? 'Dark' : ''}`
    ];
    return palette[`${paletteName}9`];
  };
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
