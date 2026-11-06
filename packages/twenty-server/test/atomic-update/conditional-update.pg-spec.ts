import { randomUUID } from 'node:crypto';
import { type DataSource, type QueryRunner } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared/types';

import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { type CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  createLocalPostgresFixture,
  ownedDatabaseUrl,
} from './local-postgres.fixture';

describe('owned PostgreSQL endpoint validation', () => {
  it('accepts fresh explicit localhost ports but rejects ambient or remote targets', () => {
    const original = process.env.ATOMIC_UPDATE_TEST_DATABASE_URL;
    try {
      process.env.ATOMIC_UPDATE_TEST_DATABASE_URL =
        'postgres://postgres@127.0.0.1:49152/workflow_atomic_test';
      expect(ownedDatabaseUrl().port).toBe('49152');
      for (const url of [
        'postgres://postgres@127.0.0.1/workflow_atomic_test',
        'postgres://postgres@localhost:49152/workflow_atomic_test',
        'postgres://postgres@192.0.2.1:49152/workflow_atomic_test',
        'postgres://postgres@127.0.0.1:49152/production',
        'postgres://postgres:secret@127.0.0.1:49152/workflow_atomic_test',
      ]) {
        process.env.ATOMIC_UPDATE_TEST_DATABASE_URL = url;
        expect(ownedDatabaseUrl).toThrow();
      }
    } finally {
      if (original === undefined)
        delete process.env.ATOMIC_UPDATE_TEST_DATABASE_URL;
      else process.env.ATOMIC_UPDATE_TEST_DATABASE_URL = original;
    }
  });
});

// No AppModule, .env, global integration setup, Redis, or production workspace.
// Real native parser/runners/WorkspaceUpdateQueryBuilder and SQL policies run;
// only core-file repository construction and event transport are in-memory.
describe('native conditional UPDATE against isolated PostgreSQL', () => {
  let fixture: Awaited<ReturnType<typeof createLocalPostgresFixture>>;
  let sourceA: DataSource;
  let sourceB: DataSource;
  const events = jest.fn();
  const id = randomUUID();
  const hiddenId = randomUUID();
  const t0 = randomUUID();
  const t1 = randomUUID();
  const t2 = randomUUID();
  const fields = ['id', 'guard', 'value', 'tenant'].map((name) => ({
    id: name,
    universalIdentifier: name,
    objectMetadataId: 'widget',
    name,
    type:
      name === 'id' || name === 'guard'
        ? FieldMetadataType.UUID
        : FieldMetadataType.TEXT,
    isNullable: false,
    isActive: true,
  })) as FlatFieldMetadata[];
  const fieldMaps = {
    universalIdentifierById: Object.fromEntries(
      fields.map((field) => [field.id, field.id]),
    ),
    byUniversalIdentifier: Object.fromEntries(
      fields.map((field) => [field.id, field]),
    ),
  } as FlatEntityMaps<FlatFieldMetadata>;
  const object = {
    id: 'widget',
    universalIdentifier: 'widget',
    nameSingular: 'widget',
    namePlural: 'widgets',
    fieldIds: fields.map((field) => field.id),
    applicationUniversalIdentifier: 'synthetic-custom',
  } as FlatObjectMetadata;
  const objectMaps = {
    universalIdentifiersByApplicationId: {},
    universalIdentifierById: { widget: 'widget' },
    byUniversalIdentifier: { widget: object },
  } as FlatEntityMaps<FlatObjectMetadata>;
  const permissions = {
    widget: {
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
    },
  };
  const authContext = {
    type: 'apiKey',
    apiKey: { id: 'key' },
    workspace: { id: 'synthetic' },
  };

  const nativeRunner = (
    source: DataSource,
    connection?: QueryRunner,
    appValue?: string,
    restrictedGuard = false,
  ) => {
    const rolePermissions = {
      widget: {
        ...permissions.widget,
        restrictedFields: restrictedGuard
          ? { guard: { canRead: false, canUpdate: true } }
          : {},
      },
    };
    const internal = {
      workspaceId: 'synthetic',
      flatObjectMetadataMaps: objectMaps,
      flatFieldMetadataMaps: fieldMaps,
      flatIndexMaps: { byUniversalIdentifier: {} },
      objectIdByNameSingular: { widget: 'widget' },
      userWorkspaceRoleMap: {},
      apiKeyRoleMap: { key: 'role' },
      flatRowLevelPermissionPredicateMaps: {
        byUniversalIdentifier:
          appValue === undefined
            ? {}
            : {
                predicate: {
                  id: 'predicate',
                  roleId: 'role',
                  objectMetadataId: 'widget',
                  fieldMetadataId: 'value',
                  operand: 'CONTAINS',
                  value: appValue,
                },
              },
      },
      flatRowLevelPermissionPredicateGroupMaps: { byUniversalIdentifier: {} },
      coreDataSource: { getRepository: jest.fn().mockReturnValue({}) },
      eventEmitterService: { emitDatabaseBatchEvent: events },
    } as unknown as WorkspaceInternalContext;
    const repository = {
      objectRecordsPermissions: rolePermissions,
      createQueryBuilder: (alias: string) =>
        new WorkspaceSelectQueryBuilder(
          source.getRepository('widget').createQueryBuilder(alias, connection),
          rolePermissions as never,
          internal,
          false,
          authContext as never,
          {} as never,
        ),
    };
    const context = {
      flatObjectMetadata: object,
      flatObjectMetadataMaps: objectMaps,
      flatFieldMetadataMaps: fieldMaps,
      authContext,
      rolePermissionConfig: { intersectionOf: ['role'] },
      repository,
      commonQueryParser: new GraphqlQueryParser(object, objectMaps, fieldMaps),
    } as unknown as CommonExtendedQueryRunnerContext;
    const many = new CommonUpdateManyQueryRunnerService();
    Object.assign(many, {
      processNestedRelationsHelper: { processNestedRelations: jest.fn() },
    });
    const runner = new CommonUpdateOneQueryRunnerService(many);
    Object.assign(runner, {
      filterArgProcessor: new FilterArgProcessorService(),
    });
    return (
      guard: string | undefined,
      value: string,
      nextGuard = t1,
      recordId = id,
    ) =>
      runner.run(
        {
          id: recordId,
          data: { value, guard: nextGuard },
          ...(guard !== undefined
            ? { precondition: { guard: { eq: guard } } }
            : {}),
          selectedFieldsResult: {
            select: { id: true, guard: true, value: true },
            relations: {},
            aggregate: {},
          },
        },
        context,
      );
  };

  beforeAll(async () => {
    fixture = await createLocalPostgresFixture();
    try {
      sourceA = await fixture.connect();
      sourceB = await fixture.connect();
    } catch (error) {
      await fixture.cleanup();
      throw error;
    }
  });
  afterAll(async () => {
    if (fixture) await fixture.cleanup();
  });
  beforeEach(async () => {
    events.mockClear();
    await fixture.admin.query(`DELETE FROM "${fixture.schema}"."_widget"`);
    await fixture.admin.query(
      `INSERT INTO "${fixture.schema}"."_widget" VALUES ($1,$2,'original','visible'),($3,$2,'hidden','hidden')`,
      [id, t0, hiddenId],
    );
  });

  it('rotates a guard and emits exactly one UPDATED batch with the returned row', async () => {
    const result = await nativeRunner(sourceA)(t0, 'winner');
    expect(result).toEqual({ id, guard: t1, value: 'winner' });
    const updated = events.mock.calls
      .map(([event]) => event)
      .filter((event) => event?.action === 'updated');
    expect(events).toHaveBeenCalledTimes(2); // Existing UPDATED + UPSERTED channels.
    expect(updated).toHaveLength(1);
    expect(updated[0].events).toHaveLength(1);
    expect(updated[0].events[0].properties.after).toMatchObject({
      id,
      value: 'winner',
      guard: t1,
    });
    expect(updated[0].events[0].properties.before).not.toHaveProperty('tenant');
    await expect(nativeRunner(sourceA)(t0, 'stale')).rejects.toMatchObject({
      code: 'PRECONDITION_FAILED',
    });
    expect(events).toHaveBeenCalledTimes(2);
  });

  it('rechecks the predicate after a real row-lock wait on another connection', async () => {
    const connectionB = sourceB.createQueryRunner();
    await connectionB.connect();
    await connectionB.startTransaction();
    let pending: Promise<unknown> | undefined;
    try {
      await nativeRunner(sourceB, connectionB)(t0, 'B-wins', t1);
      events.mockClear();
      const [{ pid }] = await sourceA.query('SELECT pg_backend_pid() AS pid');
      pending = nativeRunner(sourceA)(t0, 'A-stale', t2).then(
        (result) => ({ result }),
        (error) => ({ error }),
      );
      let waiting = false;
      const deadline = Date.now() + 4000;
      while (Date.now() < deadline) {
        const result = await fixture.admin.query(
          'SELECT wait_event_type FROM pg_stat_activity WHERE pid=$1',
          [pid],
        );
        if (result.rows[0]?.wait_event_type === 'Lock') {
          waiting = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      expect(waiting).toBe(true);
      await connectionB.commitTransaction();
      expect(await pending).toMatchObject({
        error: { code: 'PRECONDITION_FAILED' },
      });
      expect(events).not.toHaveBeenCalled();
      expect(
        await sourceA.getRepository('widget').findOneBy({ id }),
      ).toMatchObject({ value: 'B-wins', guard: t1 });
    } finally {
      if (connectionB.isTransactionActive)
        await connectionB.rollbackTransaction();
      if (pending) await pending;
      await connectionB.release();
    }
  });

  it('uses the same conflict for stale, missing, and SQL-RLS-hidden rows', async () => {
    expect(
      (
        await sourceA.query(
          'SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname=current_user',
        )
      )[0],
    ).toEqual({ rolsuper: false, rolbypassrls: false });
    for (const [guard, target] of [
      [t1, id],
      [t0, hiddenId],
      [t0, randomUUID()],
    ]) {
      await expect(
        nativeRunner(sourceA)(guard, 'denied', t2, target),
      ).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
        message: 'Update precondition failed',
      });
    }
    expect(events).not.toHaveBeenCalled();
  });

  it('returns a uniform conflict for a row hidden by actual application RLS predicates', async () => {
    await expect(
      nativeRunner(sourceA, undefined, 'unreachable')(t0, 'denied'),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    expect(events).not.toHaveBeenCalled();
    expect(
      await sourceA.getRepository('widget').findOneBy({ id }),
    ).toMatchObject({ guard: t0, value: 'original' });
  });

  it('retains application RLS on the fresh post-rotation event selector', async () => {
    await expect(
      nativeRunner(sourceA, undefined, 'original')(t0, 'original'),
    ).resolves.toMatchObject({ guard: t1 });
    expect(events).toHaveBeenCalledTimes(2);
  });
  it('denies an unreadable guard even when the native role may update it', async () => {
    await expect(
      nativeRunner(sourceA, undefined, undefined, true)(t0, 'denied'),
    ).rejects.toMatchObject({ code: 'INVALID_ARGS_FILTER' });
    expect(events).not.toHaveBeenCalled();
    expect(
      await sourceA.getRepository('widget').findOneBy({ id }),
    ).toMatchObject({ guard: t0, value: 'original' });
  });

  it('preserves legacy unconditional updates and missing-record errors', async () => {
    await expect(
      nativeRunner(sourceA)(undefined, 'legacy'),
    ).resolves.toMatchObject({ value: 'legacy' });
    await expect(
      nativeRunner(sourceA)(undefined, 'absent', t2, randomUUID()),
    ).rejects.toMatchObject({ code: 'RECORD_NOT_FOUND' });
  });

  it('demonstrates why every participating writer must rotate a unique guard', async () => {
    await nativeRunner(sourceA)(t0, 'non-rotating-writer', t0);
    // A non-rotating write cannot invalidate a previously captured guard.
    await expect(
      nativeRunner(sourceA)(t0, 'old-reader-can-still-write', t1),
    ).resolves.toMatchObject({ guard: t1 });
    await nativeRunner(sourceA)(
      undefined,
      'uncooperative-restores-old-token',
      t0,
    );
    // Reusing an old token creates ABA; UUID uniqueness is caller-owned.
    await expect(
      nativeRunner(sourceA)(t0, 'ABA-is-not-prevented', t2),
    ).resolves.toMatchObject({ guard: t2 });
  });

  it('rolls back failed writes, releases the connection, and reconciles response loss by reading', async () => {
    const connection = sourceA.createQueryRunner();
    await connection.connect();
    await connection.startTransaction();
    try {
      await nativeRunner(sourceA, connection)(t0, 'rolled-back');
      await connection.query('SELECT 1/0').catch(() => undefined);
    } finally {
      await connection.rollbackTransaction();
      await connection.release();
    }
    expect(
      await sourceA.getRepository('widget').findOneBy({ id }),
    ).toMatchObject({ value: 'original', guard: t0 });
    await nativeRunner(sourceA)(t0, 'committed-response-lost');
    expect(
      await sourceA.getRepository('widget').findOneBy({ id }),
    ).toMatchObject({ guard: t1, value: 'committed-response-lost' });
    await expect(
      nativeRunner(sourceA)(t0, 'blind-retry'),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
  });
});
