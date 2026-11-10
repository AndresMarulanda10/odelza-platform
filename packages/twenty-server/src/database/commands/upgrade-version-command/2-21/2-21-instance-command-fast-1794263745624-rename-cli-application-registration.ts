import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

@RegisteredInstanceCommand('2.21.0', 1794263745624)
export class RenameCliApplicationRegistrationFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration" SET "name" = $1 WHERE "universalIdentifier" = $2 AND "name" = $3`,
      [
        'Odelza CLI',
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        'Twenty CLI',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration" SET "name" = $1 WHERE "universalIdentifier" = $2 AND "name" = $3`,
      [
        'Twenty CLI',
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        'Odelza CLI',
      ],
    );
  }
}
