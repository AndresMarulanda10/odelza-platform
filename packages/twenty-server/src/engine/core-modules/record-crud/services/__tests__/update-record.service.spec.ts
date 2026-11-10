import { msg } from '@lingui/core/macro';
import { UpdateRecordService } from '../update-record.service';
import { type CommonApiContextBuilderService } from '../common-api-context-builder.service';
import { type CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('UpdateRecordService conditional updates', () => {
  const id = '06c544bb-0122-4672-8041-dbc59fa5d4f4';
  const execute = jest.fn();
  const build = jest.fn();
  const service = new UpdateRecordService(
    { execute } as unknown as CommonUpdateOneQueryRunnerService,
    { build } as unknown as CommonApiContextBuilderService,
  );
  const fields = [
    { id: 'name', name: 'name', type: 'TEXT' },
    { id: 'files', name: 'files', type: 'FILES' },
  ];
  const metadata = {
    id: 'widget',
    nameSingular: 'widget',
    fieldIds: ['name', 'files'],
    labelIdentifierFieldMetadataId: 'name',
  };
  const fieldMaps = {
    universalIdentifierById: { name: 'name', files: 'files' },
    byUniversalIdentifier: Object.fromEntries(
      fields.map((field) => [field.id, field]),
    ),
  };
  beforeEach(() => {
    execute.mockReset().mockResolvedValue({ results: { id, name: 'updated' } });
    build.mockReset().mockResolvedValue({
      queryRunnerContext: {
        flatObjectMetadata: metadata,
        flatFieldMetadataMaps: fieldMaps,
      },
      flatObjectMetadata: metadata,
      flatFieldMetadataMaps: fieldMaps,
      selectedFields: { id: true },
    });
  });
  const params = {
    objectName: 'widget',
    objectRecordId: id,
    objectRecord: { name: 'updated' },
    authContext: {} as never,
    rolePermissionConfig: { intersectionOf: ['workflow-role'] },
  };
  it('forwards trusted permissions and the separate condition to the native runner', async () => {
    const precondition = { guard: { eq: 'captured' } };
    await expect(
      service.execute({ ...params, precondition }),
    ).resolves.toMatchObject({ success: true });
    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        rolePermissionConfig: params.rolePermissionConfig,
      }),
    );
    expect(execute.mock.calls[0][0]).toMatchObject({
      precondition,
      data: params.objectRecord,
    });
  });
  it('returns a recognized typed conflict without changing the error string', async () => {
    execute.mockRejectedValue(
      new CommonQueryRunnerException(
        'Update precondition failed',
        CommonQueryRunnerExceptionCode.PRECONDITION_FAILED,
        { userFriendlyMessage: msg`Update precondition failed` },
      ),
    );
    expect(
      await service.execute({
        ...params,
        precondition: { guard: { eq: 'captured' } },
      }),
    ).toMatchObject({
      success: false,
      error: 'Update precondition failed',
      errorCode: 'PRECONDITION_FAILED',
    });
  });
  it('rejects files even when fieldsToUpdate would otherwise filter them out', async () => {
    expect(
      await service.execute({
        ...params,
        objectRecord: { files: [], name: 'updated' },
        fieldsToUpdate: ['name'],
        precondition: { guard: { eq: 'captured' } },
      }),
    ).toMatchObject({ success: false });
    expect(execute).not.toHaveBeenCalled();
  });
  it('does not reinterpret a legacy custom precondition record field', async () => {
    await service.execute({
      ...params,
      objectRecord: { precondition: 'custom' },
    });
    expect(execute.mock.calls[0][0]).not.toHaveProperty('precondition');
    expect(execute.mock.calls[0][0].data).toEqual({ precondition: 'custom' });
  });
});
