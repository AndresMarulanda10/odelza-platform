import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.21.0', 1790260990300)
export class AddPlanningWidgetTypesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."pageLayoutWidget_type_enum" ADD VALUE IF NOT EXISTS 'TASK_TIMELINE'`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."pageLayoutWidget_type_enum" ADD VALUE IF NOT EXISTS 'PERSONAL_FINANCE'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Enum values are retained so persisted widgets remain readable on rollback.
  }
}
