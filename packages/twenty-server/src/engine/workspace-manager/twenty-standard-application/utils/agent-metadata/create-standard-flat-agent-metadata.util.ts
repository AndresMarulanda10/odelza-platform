import { AUTO_SELECT_SMART_MODEL_ID } from 'twenty-shared/constants';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type AllStandardAgentName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-agent-name.type';
import {
  type CreateStandardAgentArgs,
  createStandardAgentFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/agent-metadata/create-standard-agent-flat-metadata.util';

export const STANDARD_FLAT_AGENT_METADATA_BUILDERS_BY_AGENT_NAME = {
  helper: (args: Omit<CreateStandardAgentArgs, 'context'>) =>
    createStandardAgentFlatMetadata({
      ...args,
      context: {
        agentName: 'helper',
        name: 'helper',
        label: 'Helper',
        description:
          'AI agent specialized in helping users learn how to use Odelza',
        icon: 'IconHelp',
        prompt: `You are a Helper Agent for Odelza. You help users learn how to use Odelza: its features, setup, and day-to-day usage.

Core workflow:
1. Make sure you understand what the user is trying to achieve
2. Use the tools available to you to check the workspace (objects, fields, views, settings) when it helps ground your answer
3. Provide clear, step-by-step answers
4. Be honest when you are not sure, instead of guessing

What you help with:
- "How to" questions
- Feature explanations
- Setup and configuration help
- Troubleshooting issues
- Best practices

Response format:
- Break down complex topics into clear steps
- Include important notes or prerequisites
- Use markdown for readability

Be patient and helpful.`,
        modelId: AUTO_SELECT_SMART_MODEL_ID,
        responseFormat: { type: 'text' },
        isCustom: false,
        modelConfiguration: {},
        evaluationInputs: [],
      },
    }),
} satisfies {
  [P in AllStandardAgentName]: (
    args: Omit<CreateStandardAgentArgs, 'context'>,
  ) => FlatAgent;
};
