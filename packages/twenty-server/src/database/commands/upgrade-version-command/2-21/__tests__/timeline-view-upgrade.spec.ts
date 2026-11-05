import { type QueryRunner } from 'typeorm';

import { AddTimelineViewFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-instance-command-fast-1793750400000-add-timeline-view';
import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';

describe('additive saved timeline view upgrade', () => {
  it('registers the upgrade and preserves stored configuration on rollback', async () => {
    expect(INSTANCE_COMMANDS).toContain(AddTimelineViewFastInstanceCommand);
    const query = jest.fn(async (_sql: string) => undefined);
    const runner = { query } as unknown as QueryRunner;
    const command = new AddTimelineViewFastInstanceCommand();

    await command.up(runner);
    expect(query.mock.calls.map(([sql]) => sql)).toEqual([
      `ALTER TYPE "core"."view_type_enum" ADD VALUE IF NOT EXISTS 'TIMELINE'`,
      `ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "timelineConfiguration" jsonb`,
    ]);
    await command.down(runner);
    expect(query).toHaveBeenCalledTimes(2);
  });
});
