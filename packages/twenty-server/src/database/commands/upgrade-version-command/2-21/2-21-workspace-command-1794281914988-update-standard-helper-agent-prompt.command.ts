import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { HELPER_AGENT_PROMPT_WITH_HELP_CENTER } from 'src/database/commands/upgrade-version-command/2-21/constants/helper-agent-prompt-with-help-center.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.21.0', 1794281914988)
@Command({
  name: 'upgrade:2-21:update-standard-helper-agent-prompt',
  description:
    'Replace the standard helper agent prompt that relied on the removed search_help_center tool',
})
export class UpdateStandardHelperAgentPromptCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { flatAgentMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatAgentMaps'],
    );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const updatedAt = new Date().toISOString();

    // Only agents still on the exact previous prompt are updated, so a
    // workspace that edited its helper agent keeps its own prompt.
    const agentsToUpdate = Object.values(
      standardAllFlatEntityMaps.flatAgentMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((standardAgent) => {
        const existingAgent =
          flatAgentMaps.byUniversalIdentifier[
            standardAgent.universalIdentifier
          ];

        if (
          !isDefined(existingAgent) ||
          existingAgent.prompt !== HELPER_AGENT_PROMPT_WITH_HELP_CENTER
        ) {
          return undefined;
        }

        return { ...existingAgent, prompt: standardAgent.prompt, updatedAt };
      })
      .filter(isDefined);

    if (agentsToUpdate.length === 0) {
      this.logger.log(
        `Standard helper agent prompt already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Updating ${agentsToUpdate.length} standard helper agent prompt(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            agent: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: agentsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to update the standard helper agent prompt:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to update the standard helper agent prompt for workspace ${workspaceId}`,
      );
    }
  }
}
