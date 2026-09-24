import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.21.0', 1790277685431)
export class AddCatalogFieldsToViewFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "catalogImageFieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "catalogSubtitleFieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "catalogDetailFieldMetadataId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "catalogImageFieldMetadataId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "catalogSubtitleFieldMetadataId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "catalogDetailFieldMetadataId"`,
    );
  }
}
