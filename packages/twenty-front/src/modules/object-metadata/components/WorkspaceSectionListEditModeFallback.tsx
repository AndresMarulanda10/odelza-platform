import { styled } from '@linaria/react';

import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { WorkspaceSectionAddMenuItemButton } from '@/navigation-menu-item/edit/components/WorkspaceSectionAddMenuItemButton';
import type { NavigationMenuItemSectionListDndKitProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionListDndKitProps';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledFallback = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

type WorkspaceSectionListEditModeFallbackProps = Pick<
  NavigationMenuItemSectionListDndKitProps,
  'filteredItems' | 'folderChildrenById' | 'onActiveObjectMetadataItemClick'
>;

export const WorkspaceSectionListEditModeFallback = ({
  filteredItems,
  folderChildrenById,
  onActiveObjectMetadataItemClick,
}: WorkspaceSectionListEditModeFallbackProps) => (
  <StyledFallback>
    <WorkspaceSectionListReadOnly
      filteredItems={filteredItems}
      folderChildrenById={folderChildrenById}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
    <WorkspaceSectionAddMenuItemButton />
  </StyledFallback>
);
