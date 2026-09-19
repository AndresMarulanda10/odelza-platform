import { type CanActivate, type Type } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';

export type PageLayoutWidgetPermissionOperation =
  | 'view'
  | 'create'
  | 'edit'
  | 'duplicate';

/**
 * Keeps widget operations independently named while preserving the current
 * workspace permission model. Source-data authorization remains in each
 * domain adapter, where denied and partial envelopes are available.
 */
export const PageLayoutWidgetPermissionGuard = (
  operation: PageLayoutWidgetPermissionOperation,
): Type<CanActivate> => {
  if (operation === 'view') {
    return NoPermissionGuard;
  }

  return SettingsPermissionGuard(PermissionFlagType.LAYOUTS);
};
