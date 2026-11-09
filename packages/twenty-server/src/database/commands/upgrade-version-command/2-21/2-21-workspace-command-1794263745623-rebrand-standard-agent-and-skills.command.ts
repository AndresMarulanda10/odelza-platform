import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rebrandStandardAiText } from 'src/database/commands/upgrade-version-command/2-21/utils/rebrand-standard-ai-text.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.21.0', 1794263745623)
@Command({
  name: 'upgrade:2-21:rebrand-standard-agent-and-skills',
  description:
    'Replace the Twenty name in the standard helper agent and skills of existing workspaces',
})
export class RebrandStandardAgentAndSkillsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { flatAgentMaps, flatSkillMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatAgentMaps',
        'flatSkillMaps',
      ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const updatedAt = new Date().toISOString();

    const agentsToUpdate = Object.keys(
      standardAllFlatEntityMaps.flatAgentMaps.byUniversalIdentifier,
    )
      .map(
        (universalIdentifier) =>
          flatAgentMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined)
      .map((agent) => ({
        ...agent,
        description: isDefined(agent.description)
          ? rebrandStandardAiText(agent.description)
          : null,
        prompt: rebrandStandardAiText(agent.prompt),
        updatedAt,
      }))
      .filter((agent) => {
        const existingAgent =
          flatAgentMaps.byUniversalIdentifier[agent.universalIdentifier];

        return (
          agent.description !== existingAgent?.description ||
          agent.prompt !== existingAgent?.prompt
        );
      });

    const skillsToUpdate = Object.keys(
      standardAllFlatEntityMaps.flatSkillMaps.byUniversalIdentifier,
    )
      .map(
        (universalIdentifier) =>
          flatSkillMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined)
      .map((skill) => ({
        ...skill,
        content: rebrandStandardAiText(skill.content),
        updatedAt,
      }))
      .filter(
        (skill) =>
          skill.content !==
          flatSkillMaps.byUniversalIdentifier[skill.universalIdentifier]
            ?.content,
      );

    if (agentsToUpdate.length === 0 && skillsToUpdate.length === 0) {
      this.logger.log(
        `Standard agent and skills already rebranded for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Rebranding ${agentsToUpdate.length} agent(s) and ${skillsToUpdate.length} skill(s) for workspace ${workspaceId}`,
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
            skill: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: skillsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to rebrand standard agent and skills:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to rebrand standard agent and skills for workspace ${workspaceId}`,
      );
    }
  }
}
