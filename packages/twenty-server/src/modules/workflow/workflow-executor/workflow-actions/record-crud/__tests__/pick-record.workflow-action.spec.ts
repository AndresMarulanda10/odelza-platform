import { FieldMetadataType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { GroupByArgProcessorService } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/group-by-arg-processor.service';
import { GroupByRecordsService } from 'src/engine/core-modules/record-crud/services/group-by-records.service';
import { PickRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/pick-record.workflow-action';

describe('PickRecordWorkflowAction relation grouping compatibility', () => {
  it('passes the real tool schema and native group parser for fewest related records', async () => {
    const fields = [
      {
        id: 'company',
        name: 'company',
        type: FieldMetadataType.RELATION,
        isActive: true,
        relationTargetObjectMetadataId: 'company',
        settings: { relationType: 'MANY_TO_ONE' },
      },
      {
        id: 'company-id',
        name: 'id',
        type: FieldMetadataType.UUID,
        isActive: true,
      },
    ];
    const object = {
      id: 'person',
      nameSingular: 'person',
      fieldIds: ['company'],
    };
    const company = {
      id: 'company',
      nameSingular: 'company',
      fieldIds: ['company-id'],
    };
    const maps = (items: { id: string }[]) => ({
      byUniversalIdentifier: Object.fromEntries(
        items.map((item) => [item.id, item]),
      ),
      universalIdentifierById: Object.fromEntries(
        items.map((item) => [item.id, item.id]),
      ),
    });
    const processor = new GroupByArgProcessorService();
    const context = {
      flatObjectMetadata: object,
      flatObjectMetadataMaps: maps([object, company]),
      flatFieldMetadataMaps: maps(fields),
      objectsPermissions: { person: { restrictedFields: {} } },
      queryRunnerContext: {},
    };
    const native = {
      execute: jest.fn(async (args) => {
        processor.validateAndTransformGroupByFieldsOrThrow({
          ...context,
          groupBy: args.groupBy,
        } as never);
        return {
          results: [
            {
              groupByDimensionValues: ['11111111-1111-4111-8111-111111111111'],
              totalCount: 3,
            },
            {
              groupByDimensionValues: ['22222222-2222-4222-8222-222222222222'],
              totalCount: 1,
            },
          ],
        };
      }),
    };
    const groupBy = new GroupByRecordsService(
      native as never,
      { build: jest.fn().mockResolvedValue(context) } as never,
      processor,
    );
    const candidates = [
      { id: '11111111-1111-4111-8111-111111111111' },
      { id: '22222222-2222-4222-8222-222222222222' },
    ];
    const action = new PickRecordWorkflowAction(
      {
        execute: jest.fn().mockResolvedValue({
          success: true,
          result: { records: candidates },
        }),
      } as never,
      groupBy,
      {
        getExecutionContext: jest.fn().mockResolvedValue({
          authContext: { workspace: { id: 'synthetic' } },
          rolePermissionConfig: { intersectionOf: ['agent'] },
        }),
      } as never,
      {} as never,
    );
    const output = await action.execute({
      currentStepId: 'pick',
      steps: [
        {
          id: 'pick',
          type: WorkflowActionType.PICK_RECORD,
          settings: {
            input: {
              objectName: 'company',
              recordIds: candidates.map(({ id }) => id),
              strategy: 'LOAD_BALANCED',
              loadBalance: {
                objectNameSingular: 'person',
                fieldName: 'company',
              },
            },
          },
        },
      ],
      context: {},
      runInfo: { workspaceId: 'synthetic' },
    } as never);
    expect(output).toEqual({ result: candidates[1] });
    expect(native.execute).toHaveBeenCalledTimes(1);
  });
});
