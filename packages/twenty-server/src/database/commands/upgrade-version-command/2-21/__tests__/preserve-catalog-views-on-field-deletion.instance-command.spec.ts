import { type QueryRunner } from 'typeorm';

import { PreserveCatalogViewsOnFieldDeletionFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-instance-command-fast-1791231000000-preserve-catalog-views-on-field-deletion';
import { getRegisteredInstanceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

describe('PreserveCatalogViewsOnFieldDeletionFastInstanceCommand', () => {
  let command: PreserveCatalogViewsOnFieldDeletionFastInstanceCommand;

  beforeEach(() => {
    command = new PreserveCatalogViewsOnFieldDeletionFastInstanceCommand();
  });

  it('is registered as a 2.21 fast instance command', () => {
    expect(
      getRegisteredInstanceCommandMetadata(
        PreserveCatalogViewsOnFieldDeletionFastInstanceCommand,
      ),
    ).toEqual({
      version: '2.21.0',
      timestamp: 1791231000000,
      type: 'fast',
    });
  });

  it('changes the Catalog role foreign keys to clear roles on field deletion', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const queryRunner = { query } as unknown as QueryRunner;

    await command.up(queryRunner);

    const statements = query.mock.calls.map((call) => call[0] as string);

    expect(statements).toEqual([
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_edf741f7483b1ea09a52ee29051"',
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_edf741f7483b1ea09a52ee29051" FOREIGN KEY ("catalogImageFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_b0dbff448581e37774eb2584b7a"',
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_b0dbff448581e37774eb2584b7a" FOREIGN KEY ("catalogSubtitleFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_32cee105043f461177963c16449"',
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_32cee105043f461177963c16449" FOREIGN KEY ("catalogDetailFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    ]);
  });

  it('restores the prior Catalog role foreign key behavior when rolled back', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const queryRunner = { query } as unknown as QueryRunner;

    await command.down(queryRunner);

    const statements = query.mock.calls.map((call) => call[0] as string);

    expect(statements).toEqual([
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_edf741f7483b1ea09a52ee29051"',
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_edf741f7483b1ea09a52ee29051" FOREIGN KEY ("catalogImageFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_b0dbff448581e37774eb2584b7a"',
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_b0dbff448581e37774eb2584b7a" FOREIGN KEY ("catalogSubtitleFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_32cee105043f461177963c16449"',
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_32cee105043f461177963c16449" FOREIGN KEY ("catalogDetailFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ]);
  });
});
