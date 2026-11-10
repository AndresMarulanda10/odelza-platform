import { type QueryRunner } from 'typeorm';

import { RenameCliApplicationRegistrationFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-instance-command-fast-1794263745624-rename-cli-application-registration';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

describe('RenameCliApplicationRegistrationFastInstanceCommand', () => {
  const query = jest.fn(async () => undefined);
  const queryRunner = { query } as unknown as QueryRunner;
  const command = new RenameCliApplicationRegistrationFastInstanceCommand();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should rename only the CLI registration that still has the Twenty name', async () => {
    await command.up(queryRunner);

    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE "core"."applicationRegistration"'),
      [
        'Odelza CLI',
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        'Twenty CLI',
      ],
    );
  });

  it('should restore the Twenty name when rolled back', async () => {
    await command.down(queryRunner);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE "core"."applicationRegistration"'),
      [
        'Twenty CLI',
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        'Odelza CLI',
      ],
    );
  });

  it('should match the name new instances register the CLI with', () => {
    expect(TWENTY_CLI_APPLICATION_REGISTRATION.name).toBe('Odelza CLI');
  });
});
