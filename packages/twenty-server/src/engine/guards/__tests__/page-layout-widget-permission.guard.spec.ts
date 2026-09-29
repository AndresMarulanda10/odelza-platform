import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import {
  PageLayoutWidgetPermissionGuard,
  type PageLayoutWidgetPermissionOperation,
} from 'src/engine/guards/page-layout-widget-permission.guard';

describe('PageLayoutWidgetPermissionGuard', () => {
  it('allows view through the authenticated workspace boundary', () => {
    expect(PageLayoutWidgetPermissionGuard('view')).toBe(NoPermissionGuard);
  });

  it.each([
    'create',
    'edit',
    'duplicate',
  ] as PageLayoutWidgetPermissionOperation[])(
    'requires settings permission for %s',
    (operation) => {
      expect(PageLayoutWidgetPermissionGuard(operation)).not.toBe(
        NoPermissionGuard,
      );
    },
  );
});
