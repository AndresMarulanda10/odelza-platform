import { type QueryRunner } from 'typeorm';
import { AddBeforeTodayViewFilterOperandFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-instance-command-fast-1792022400000-add-before-today-view-filter-operand';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('before-today native enum upgrade source (no database)', () => {
  it('adds the shared value idempotently and retains persisted values on rollback', async () => {
    const query = jest.fn(async (_sql: string) => undefined);
    const runner = { query } as unknown as QueryRunner;
    const command = new AddBeforeTodayViewFilterOperandFastInstanceCommand();
    await command.up(runner);
    expect(query).toHaveBeenCalledWith(
      `ALTER TYPE "core"."viewFilter_operand_enum" ADD VALUE IF NOT EXISTS '${ViewFilterOperand.IS_BEFORE_TODAY}'`,
    );
    expect(query).toHaveBeenCalledTimes(1);
    await command.down(runner);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
