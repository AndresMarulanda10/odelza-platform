import { HELPER_AGENT_PROMPT_WITH_HELP_CENTER } from 'src/database/commands/upgrade-version-command/2-21/constants/helper-agent-prompt-with-help-center.constant';
import { STANDARD_FLAT_AGENT_METADATA_BUILDERS_BY_AGENT_NAME } from 'src/engine/workspace-manager/twenty-standard-application/utils/agent-metadata/create-standard-flat-agent-metadata.util';

describe('HELPER_AGENT_PROMPT_WITH_HELP_CENTER', () => {
  it('should be the prompt that still relied on the help center tool', () => {
    expect(HELPER_AGENT_PROMPT_WITH_HELP_CENTER).toContain(
      'search_help_center',
    );
  });

  it('should differ from the current standard helper agent prompt', () => {
    const helperAgent =
      STANDARD_FLAT_AGENT_METADATA_BUILDERS_BY_AGENT_NAME.helper({
        now: new Date().toISOString(),
        workspaceId: '20202020-0000-4000-8000-000000000000',
        twentyStandardApplicationId: '20202020-0000-4000-8000-000000000001',
      } as unknown as Parameters<
        typeof STANDARD_FLAT_AGENT_METADATA_BUILDERS_BY_AGENT_NAME.helper
      >[0]);

    expect(helperAgent.prompt).not.toBe(HELPER_AGENT_PROMPT_WITH_HELP_CENTER);
    expect(helperAgent.prompt).not.toContain('search_help_center');
  });
});
