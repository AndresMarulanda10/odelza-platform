import base from '../../jest.config.mjs';

export default {
  ...base,
  rootDir: '../..',
  displayName: 'atomic-update-postgres',
  setupFilesAfterEnv: [],
  fakeTimers: { enableGlobally: false },
  testRegex: 'test/atomic-update/.*\\.pg-spec\\.ts$',
  testTimeout: 20000,
};
