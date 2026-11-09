// Only the exact phrases the standard agent and skills shipped with are
// replaced, so edits a workspace made around them are kept.
const STANDARD_AI_TEXT_REBRANDS: ReadonlyArray<[string, string]> = [
  [
    'AI agent specialized in helping users learn how to use Twenty CRM',
    'AI agent specialized in helping users learn how to use Odelza',
  ],
  ['You are a Helper Agent for Twenty. ', 'You are a Helper Agent for Odelza. '],
  [
    'Always base answers on official Twenty documentation.',
    'Always base answers on the official documentation.',
  ],
  [
    '## Calling Twenty Tools from Python (MCP Bridge)',
    '## Calling Odelza Tools from Python (MCP Bridge)',
  ],
];

export const rebrandStandardAiText = (text: string): string =>
  STANDARD_AI_TEXT_REBRANDS.reduce(
    (result, [twentyPhrase, odelzaPhrase]) =>
      result.split(twentyPhrase).join(odelzaPhrase),
    text,
  );
