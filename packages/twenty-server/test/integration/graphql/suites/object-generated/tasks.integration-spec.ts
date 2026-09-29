import { randomUUID } from 'node:crypto';

import { gql } from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared/types';
import request from 'supertest';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const TIMELINE_TASK_GQL_FIELDS = `
  id
  title
  startDate
  dueAt
  progress
`;

const timelineTaskId = randomUUID();
const timelineFieldNames = ['startDate', 'progress'] as const;
const timelineFieldMetadataIds: string[] = [];

const normalizeDate = (value: string) => new Date(value).toISOString();

describe('tasksResolver (e2e)', () => {
  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      input: {
        filter: {},
        paging: { first: 100 },
      },
      gqlFields: 'id nameSingular',
      expectToFail: false,
    });

    const taskObjectMetadataId = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'task',
    )?.id;

    expect(taskObjectMetadataId).toBeDefined();

    for (const [index, fieldName] of timelineFieldNames.entries()) {
      const { data, errors } = await createOneFieldMetadata({
        input: {
          objectMetadataId: taskObjectMetadataId as string,
          name: fieldName,
          label: `Timeline ${fieldName}`,
          type: index === 0 ? FieldMetadataType.DATE : FieldMetadataType.NUMBER,
        },
        gqlFields: 'id',
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      timelineFieldMetadataIds.push(data.createOneField.id);
    }
  });

  afterAll(async () => {
    if (timelineTaskId) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'task',
          gqlFields: 'id',
          recordId: timelineTaskId,
        }),
      );
    }

    for (const fieldMetadataId of timelineFieldMetadataIds) {
      await deleteOneFieldMetadata({
        input: { idToDelete: fieldMetadataId },
        expectToFail: false,
      });
    }
  });

  it('should find many tasks', () => {
    const queryData = {
      query: `
        query tasks {
          tasks {
            edges {
              node {
                position
                title
                bodyV2 {
                  markdown
                  blocknote
                }
                dueAt
                status
                id
                createdAt
                updatedAt
                deletedAt
                assigneeId
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.tasks;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const tasks = edges[0].node;

          expect(tasks).toHaveProperty('position');
          expect(tasks).toHaveProperty('title');
          expect(tasks).toHaveProperty('bodyV2');
          expect(tasks).toHaveProperty('dueAt');
          expect(tasks).toHaveProperty('status');
          expect(tasks).toHaveProperty('id');
          expect(tasks).toHaveProperty('createdAt');
          expect(tasks).toHaveProperty('updatedAt');
          expect(tasks).toHaveProperty('deletedAt');
          expect(tasks).toHaveProperty('assigneeId');
        }
      });
  });

  it('should deny task values for a member without task read permission', async () => {
    let temporaryRoleId: string | undefined;
    let originalMemberRoleId: string | undefined;

    try {
      const rolesResponse = await makeMetadataAPIRequest({
        query: gql('query GetRoles { getRoles { id label } }'),
      });
      originalMemberRoleId = rolesResponse.body.data.getRoles.find(
        (role: { label: string; id: string }) => role.label === 'Member',
      )?.id;
      expect(originalMemberRoleId).toBeDefined();
      const { objects } = await findManyObjectMetadata({
        input: { filter: {}, paging: { first: 100 } },
        gqlFields: 'id nameSingular',
        expectToFail: false,
      });
      const taskObjectMetadataId = objects.find(
        (objectMetadata) => objectMetadata.nameSingular === 'task',
      )?.id;
      expect(taskObjectMetadataId).toBeDefined();
      const createRoleResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateOneRole {
            createOneRole(
              createRoleInput: {
                label: "TaskSourceDeniedRole_${randomUUID()}"
                description: "Test role without task read permission"
                canUpdateAllSettings: false
                canReadAllObjectRecords: false
                canUpdateAllObjectRecords: false
                canSoftDeleteAllObjectRecords: false
                canDestroyAllObjectRecords: false
              }
            ) {
              id
            }
          }
        `,
      });
      const createdRoleId: string =
        createRoleResponse.body.data.createOneRole.id;
      temporaryRoleId = createdRoleId;

      await makeMetadataAPIRequest({
        query: gql`
          mutation UpsertObjectPermissions(
            $roleId: UUID!
            $objectPermissions: [ObjectPermissionInput!]!
          ) {
            upsertObjectPermissions(
              upsertObjectPermissionsInput: {
                roleId: $roleId
                objectPermissions: $objectPermissions
              }
            ) {
              objectMetadataId
            }
          }
        `,
        variables: {
          roleId: createdRoleId,
          objectPermissions: [
            {
              objectMetadataId: taskObjectMetadataId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        },
      });

      await updateWorkspaceMemberRole({
        client,
        roleId: createdRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      const response = await makeGraphqlAPIRequestWithMemberRole({
        query: gql`
          query Tasks {
            tasks {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        `,
      });

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: PermissionsExceptionMessage.PERMISSION_DENIED,
            extensions: expect.objectContaining({ code: ErrorCode.FORBIDDEN }),
          }),
        ]),
      );
      expect(response.body.data?.tasks).toBeNull();
    } finally {
      try {
        if (originalMemberRoleId) {
          await updateWorkspaceMemberRole({
            client,
            roleId: originalMemberRoleId,
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          });
        }
      } finally {
        if (temporaryRoleId) {
          await deleteRole(client, temporaryRoleId);
        }
      }
    }
  });

  it('should persist accepted timeline edits and reject start-after-due updates', async () => {
    const createResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'task',
        gqlFields: TIMELINE_TASK_GQL_FIELDS,
        data: {
          id: timelineTaskId,
          title: 'Timeline persistence task',
          startDate: '2026-04-01',
          dueAt: '2026-04-05T00:00:00.000Z',
          progress: 25,
        },
      }),
    );

    expect(createResponse.body.errors).toBeUndefined();

    const updateResponse = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'task',
        gqlFields: TIMELINE_TASK_GQL_FIELDS,
        recordId: timelineTaskId,
        data: {
          startDate: '2026-04-10',
          dueAt: '2026-04-15T00:00:00.000Z',
          progress: 75,
        },
      }),
    );

    expect(updateResponse.body.errors).toBeUndefined();

    const reloadResponse = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'task',
        objectMetadataPluralName: 'tasks',
        gqlFields: TIMELINE_TASK_GQL_FIELDS,
        filter: { id: { eq: timelineTaskId } },
      }),
    );

    expect(reloadResponse.body.errors).toBeUndefined();
    const reloadedTask = reloadResponse.body.data.tasks.edges[0].node;

    expect(reloadedTask.startDate).toBe('2026-04-10');
    expect(normalizeDate(reloadedTask.dueAt)).toBe('2026-04-15T00:00:00.000Z');
    expect(reloadedTask.progress).toBe(75);

    const rejectedUpdateResponse = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'task',
        gqlFields: TIMELINE_TASK_GQL_FIELDS,
        recordId: timelineTaskId,
        data: { startDate: '2026-04-16' },
      }),
    );

    expect(rejectedUpdateResponse.body.data.updateTask).toBeNull();
    expect(rejectedUpdateResponse.body.errors[0].message).toContain(
      'cannot be after its inclusive end date',
    );

    const unchangedResponse = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'task',
        objectMetadataPluralName: 'tasks',
        gqlFields: TIMELINE_TASK_GQL_FIELDS,
        filter: { id: { eq: timelineTaskId } },
      }),
    );

    const unchangedTask = unchangedResponse.body.data.tasks.edges[0].node;

    expect(unchangedTask.startDate).toBe('2026-04-10');
    expect(normalizeDate(unchangedTask.dueAt)).toBe('2026-04-15T00:00:00.000Z');
    expect(unchangedTask.progress).toBe(75);
  });
});
