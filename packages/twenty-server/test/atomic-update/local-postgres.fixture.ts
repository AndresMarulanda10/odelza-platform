import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { DataSource, EntitySchema } from 'typeorm';

export const ownedDatabaseUrl = (): URL => {
  const raw = process.env.ATOMIC_UPDATE_TEST_DATABASE_URL;
  if (!raw)
    throw new Error(
      'ATOMIC_UPDATE_TEST_DATABASE_URL is required; no ambient database fallback',
    );
  const url = new URL(raw);
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    url.hostname !== '127.0.0.1' ||
    !/^\d+$/.test(url.port) ||
    Number(url.port) < 1 ||
    url.pathname !== '/workflow_atomic_test' ||
    url.username !== 'postgres' ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'Only the explicitly owned localhost workflow_atomic_test fixture is permitted',
    );
  }
  return url;
};

export const createLocalPostgresFixture = async () => {
  const url = ownedDatabaseUrl();
  const nonce = randomUUID().replace(/-/g, '');
  const schema = `cas_${nonce}`;
  const role = `cas_${nonce}_writer`;
  const admin = new Client({
    connectionString: url.toString(),
    statement_timeout: 5000,
    connectionTimeoutMillis: 5000,
  });
  const sources: DataSource[] = [];
  const cleanup = async () => {
    await Promise.all(
      sources
        .filter((source) => source.isInitialized)
        .map((source) => source.destroy()),
    );
    try {
      await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await admin.query(`DROP ROLE IF EXISTS "${role}"`);
    } finally {
      await admin.end();
    }
  };
  await admin.connect();
  try {
    await admin.query(`CREATE SCHEMA "${schema}"`);
    await admin.query(
      `CREATE ROLE "${role}" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS`,
    );
    await admin.query(
      `CREATE TABLE "${schema}"."_widget" (id uuid PRIMARY KEY, guard uuid NOT NULL, value text NOT NULL, tenant text NOT NULL)`,
    );
    await admin.query(
      `ALTER TABLE "${schema}"."_widget" ENABLE ROW LEVEL SECURITY`,
    );
    await admin.query(
      `CREATE POLICY visible ON "${schema}"."_widget" USING (tenant = 'visible') WITH CHECK (tenant = 'visible')`,
    );
    await admin.query(`GRANT USAGE ON SCHEMA "${schema}" TO "${role}"`);
    await admin.query(
      `GRANT SELECT, INSERT, UPDATE ON "${schema}"."_widget" TO "${role}"`,
    );
    const connect = async () => {
      const roleUrl = new URL(url);
      roleUrl.username = role;
      const source = new DataSource({
        type: 'postgres',
        url: roleUrl.toString(),
        schema,
        synchronize: false,
        entities: [
          new EntitySchema({
            name: 'widget',
            tableName: '_widget',
            schema,
            columns: {
              id: { type: 'uuid', primary: true },
              guard: { type: 'uuid' },
              value: { type: 'text' },
              tenant: { type: 'text' },
            },
          }),
        ],
        extra: {
          max: 1,
          connectionTimeoutMillis: 5000,
          statement_timeout: 8000,
        },
      });
      sources.push(source);
      await source.initialize();
      return source;
    };
    return { schema, role, admin, connect, cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  }
};
