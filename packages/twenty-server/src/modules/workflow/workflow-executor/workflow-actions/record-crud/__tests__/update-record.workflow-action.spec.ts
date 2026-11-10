import { UpdateRecordWorkflowAction } from '../update-record.workflow-action';

describe('conditional workflow update action', () => {
  const id = '06c544bb-0122-4672-8041-dbc59fa5d4f4';
  const execute = jest.fn();
  const fields = [
    { id: 'name', name: 'name', type: 'TEXT' },
    { id: 'files', name: 'files', type: 'FILES' },
  ];
  const metadata = {
    flatObjectMetadata: {
      id: 'widget',
      nameSingular: 'widget',
      fieldIds: ['name', 'files'],
    },
    flatObjectMetadataMaps: {},
    flatFieldMetadataMaps: {
      universalIdentifierById: { name: 'name', files: 'files' },
      byUniversalIdentifier: Object.fromEntries(
        fields.map((field) => [field.id, field]),
      ),
    },
  };
  const rolePermissionConfig = { intersectionOf: ['workflow-role'] };
  const action = new UpdateRecordWorkflowAction(
    { execute } as never,
    {
      getExecutionContext: async () => ({
        authContext: {},
        rolePermissionConfig,
      }),
    } as never,
    { getObjectMetadataInfo: async () => metadata } as never,
  );
  const input = (objectRecord: object = { name: 'updated' }) =>
    ({
      currentStepId: 'step',
      steps: [
        {
          id: 'step',
          type: 'UPDATE_RECORD',
          settings: {
            input: {
              objectName: 'widget',
              objectRecordId: id,
              fieldsToUpdate: ['name'],
              objectRecord,
              precondition: { guard: { eq: '{{trigger.guard}}' } },
            },
          },
        },
      ],
      context: { trigger: { guard: 'captured' } },
      runInfo: { workspaceId: 'workspace' },
    }) as never;
  it('resolves a guard binding before forwarding it with trusted workflow permissions', async () => {
    execute.mockResolvedValue({
      success: false,
      error: 'Update precondition failed',
      errorCode: 'PRECONDITION_FAILED',
    });
    await expect(action.execute(input())).resolves.toEqual({
      error: 'Update precondition failed',
      errorCode: 'PRECONDITION_FAILED',
    });
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        precondition: { guard: { eq: 'captured' } },
        rolePermissionConfig,
      }),
    );
  });
  it('rejects unsafe payloads before the update service or filtering can hide them', async () => {
    execute.mockClear();
    await expect(
      action.execute(input({ name: 'updated', files: [] })),
    ).rejects.toThrow('Conditional updates support scalar');
    expect(execute).not.toHaveBeenCalled();
  });
});
