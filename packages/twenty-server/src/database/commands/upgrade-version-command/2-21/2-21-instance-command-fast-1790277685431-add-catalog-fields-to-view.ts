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

    // Las claves foraneas van en el mismo comando: si solo se anaden las
    // columnas, el control de migraciones pendientes del CI detecta la
    // diferencia contra las entidades y genera un comando nuevo.
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_edf741f7483b1ea09a52ee29051"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_edf741f7483b1ea09a52ee29051" FOREIGN KEY ("catalogImageFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_b0dbff448581e37774eb2584b7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_b0dbff448581e37774eb2584b7a" FOREIGN KEY ("catalogSubtitleFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_32cee105043f461177963c16449"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_32cee105043f461177963c16449" FOREIGN KEY ("catalogDetailFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_edf741f7483b1ea09a52ee29051"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_b0dbff448581e37774eb2584b7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_32cee105043f461177963c16449"`,
    );
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
