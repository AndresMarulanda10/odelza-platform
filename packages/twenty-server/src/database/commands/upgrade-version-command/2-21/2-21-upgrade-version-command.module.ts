import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RebrandStandardAgentAndSkillsCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1794263745623-rebrand-standard-agent-and-skills.command';
import { UpdateStandardHelperAgentPromptCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1794281914988-update-standard-helper-agent-prompt.command';
import { UpdateCommunityAndBillingCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1794281914989-update-community-and-billing-command-menu-items.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RebrandStandardAgentAndSkillsCommand,
    UpdateStandardHelperAgentPromptCommand,
    UpdateCommunityAndBillingCommandMenuItemsCommand,
  ],
})
export class V2_21_UpgradeVersionCommandModule {}
