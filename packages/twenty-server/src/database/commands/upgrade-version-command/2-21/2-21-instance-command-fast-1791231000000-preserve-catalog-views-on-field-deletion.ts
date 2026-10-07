import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const CATALOG_FIELD_ROLE_FOREIGN_KEYS = [
  {
    constraintName: 'FK_edf741f7483b1ea09a52ee29051',
    columnName: 'catalogImageFieldMetadataId',
  },
  {
    constraintName: 'FK_b0dbff448581e37774eb2584b7a',
    columnName: 'catalogSubtitleFieldMetadataId',
  },
  {
    constraintName: 'FK_32cee105043f461177963c16449',
    columnName: 'catalogDetailFieldMetadataId',
  },
] as const;

@RegisteredInstanceCommand('2.21.0', 1791231000000)
export class PreserveCatalogViewsOnFieldDeletionFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const {
      constraintName,
      columnName,
    } of CATALOG_FIELD_ROLE_FOREIGN_KEYS) {
      await queryRunner.query(
        `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "${constraintName}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."view" ADD CONSTRAINT "${constraintName}" FOREIGN KEY ("${columnName}") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const {
      constraintName,
      columnName,
    } of CATALOG_FIELD_ROLE_FOREIGN_KEYS) {
      await queryRunner.query(
        `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "${constraintName}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."view" ADD CONSTRAINT "${constraintName}" FOREIGN KEY ("${columnName}") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }
}
