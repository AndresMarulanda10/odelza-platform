import { Logger } from '@nestjs/common';

import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type DevSeederService } from 'src/engine/workspace-manager/dev-seeder/services/dev-seeder.service';

describe('DataSeedWorkspaceCommand', () => {
  const seedDev = jest.fn();
  const command = new DataSeedWorkspaceCommand({
    seedDev,
  } as unknown as DevSeederService);

  beforeEach(() => {
    seedDev.mockReset().mockResolvedValue(undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('completes both workspaces on successful seeding', async () => {
    await expect(command.run([], {})).resolves.toBeUndefined();
    expect(seedDev.mock.calls).toEqual([
      [SEED_APPLE_WORKSPACE_ID, { light: undefined }],
      [SEED_YCOMBINATOR_WORKSPACE_ID, { light: undefined }],
    ]);
  });

  it('preserves the light-seed selection', async () => {
    await command.run([], { light: true });
    expect(seedDev.mock.calls).toEqual([
      [SEED_APPLE_WORKSPACE_ID, { light: true }],
    ]);
  });

  it('logs and rejects with the original error without seeding the next workspace', async () => {
    const error = new Error('synthetic seed failure');

    seedDev.mockRejectedValueOnce(error);
    await expect(command.run([], {})).rejects.toBe(error);
    expect(seedDev).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.error).toHaveBeenCalledWith(error);
  });
});
