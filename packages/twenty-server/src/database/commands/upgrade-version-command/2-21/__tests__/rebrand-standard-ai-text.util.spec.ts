import { rebrandStandardAiText } from 'src/database/commands/upgrade-version-command/2-21/utils/rebrand-standard-ai-text.util';

describe('rebrandStandardAiText', () => {
  it('should rebrand the phrases the standard helper agent shipped with', () => {
    const previousPrompt =
      'You are a Helper Agent for Twenty. You answer questions.\n\nAlways base answers on official Twenty documentation. Be patient and helpful.';

    expect(rebrandStandardAiText(previousPrompt)).toBe(
      'You are a Helper Agent for Odelza. You answer questions.\n\nAlways base answers on the official documentation. Be patient and helpful.',
    );
  });

  it('should rebrand the standard skill heading', () => {
    expect(
      rebrandStandardAiText(
        'Intro\n\n## Calling Twenty Tools from Python (MCP Bridge)\n\nBody',
      ),
    ).toBe('Intro\n\n## Calling Odelza Tools from Python (MCP Bridge)\n\nBody');
  });

  it('should keep other mentions written by the workspace', () => {
    const customText = 'Our team migrated from Twenty last year.';

    expect(rebrandStandardAiText(customText)).toBe(customText);
  });

  it('should leave already rebranded text unchanged', () => {
    const rebrandedText =
      'AI agent specialized in helping users learn how to use Odelza';

    expect(rebrandStandardAiText(rebrandedText)).toBe(rebrandedText);
  });
});
