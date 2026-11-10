import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Each item is only updated while it still matches what it shipped with, so a
// workspace that customized it keeps its own version.
const isStillOnPreviousVersion = (
  existingItem: FlatCommandMenuItem,
): boolean => {
  switch (existingItem.universalIdentifier) {
    case STANDARD_COMMAND_MENU_ITEMS.goToSettingsUpdates.universalIdentifier:
      return (
        (existingItem.payload as { path?: string } | null)?.path ===
        '/settings/community'
      );
    case STANDARD_COMMAND_MENU_ITEMS.goToSettingsBilling.universalIdentifier:
      return (
        existingItem.conditionalAvailabilityExpression ===
        'permissionFlags.WORKSPACE'
      );
    default:
      return false;
  }
};

@RegisteredWorkspaceCommand('2.21.0', 1794281914989)
@Command({
  name: 'upgrade:2-21:update-community-and-billing-command-menu-items',
  description:
    'Point the community command menu item to the beta features page and hide the billing one when billing is disabled',
})
export class UpdateCommunityAndBillingCommandMenuItemsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const updatedAt = new Date().toISOString();

    const itemsToUpdate = [
      STANDARD_COMMAND_MENU_ITEMS.goToSettingsUpdates.universalIdentifier,
      STANDARD_COMMAND_MENU_ITEMS.goToSettingsBilling.universalIdentifier,
    ]
      .map((universalIdentifier) => {
        const standardItem =
          standardAllFlatEntityMaps.flatCommandMenuItemMaps
            .byUniversalIdentifier[universalIdentifier];
        const existingItem =
          existingFlatCommandMenuItemMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        if (
          !isDefined(standardItem) ||
          !isDefined(existingItem) ||
          !isStillOnPreviousVersion(existingItem)
        ) {
          return undefined;
        }

        return {
          ...existingItem,
          label: standardItem.label,
          shortLabel: standardItem.shortLabel,
          icon: standardItem.icon,
          payload: standardItem.payload,
          conditionalAvailabilityExpression:
            standardItem.conditionalAvailabilityExpression,
          updatedAt,
        };
      })
      .filter(isDefined);

    if (itemsToUpdate.length === 0) {
      this.logger.log(
        `Community and billing command menu items already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Updating ${itemsToUpdate.length} command menu item(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: itemsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to update community and billing command menu items:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to update community and billing command menu items for workspace ${workspaceId}`,
      );
    }
  }
}
