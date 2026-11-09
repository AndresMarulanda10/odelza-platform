import { Injectable } from '@nestjs/common';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  isRecordFilterValueValid,
  getFilterTypeFromFieldType,
  FILTER_OPERANDS_MAP,
} from 'twenty-shared/utils';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { GroupByRecordsService } from 'src/engine/core-modules/record-crud/services/group-by-records.service';
import { type ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowGroupByRecordsAction } from './guards/is-workflow-group-by-records-action.guard';
import { parseWorkflowGroupByInput } from './utils/parse-workflow-group-by-input.util';

@Injectable()
export class GroupByRecordsWorkflowAction implements WorkflowAction {
  constructor(
    private readonly groupByRecordsService: GroupByRecordsService,
    private readonly executionContextService: WorkflowExecutionContextService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ steps, stepId: currentStepId });
    if (!isWorkflowGroupByRecordsAction(step))
      throw new WorkflowStepExecutorException(
        'Step is not a group records action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    let input: ReturnType<typeof parseWorkflowGroupByInput>;
    try {
      input = parseWorkflowGroupByInput(step.settings.input, context);
    } catch {
      throw new WorkflowStepExecutorException(
        'Invalid or unresolved group-by input',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }
    const executionContext =
      await this.executionContextService.getExecutionContext(runInfo);
    const { flatFieldMetadataMaps, flatObjectMetadata } =
      await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
        input.objectName,
        runInfo.workspaceId,
      );
    for (const filter of input.filter?.recordFilters ?? []) {
      const field = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: filter.fieldMetadataId,
      });
      if (
        !field ||
        !flatObjectMetadata.fieldIds.includes(field.id) ||
        filter.type !== getFilterTypeFromFieldType(field.type)
      ) {
        throw new WorkflowStepExecutorException(
          'Unknown or invalid group-by filter field',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      }
      const operands =
        FILTER_OPERANDS_MAP[filter.type as keyof typeof FILTER_OPERANDS_MAP];
      if (
        !operands?.some((operand) => operand === filter.operand) ||
        filter.relationTargetFieldMetadataId ||
        (filter.subFieldName &&
          !compositeTypeDefinitions
            .get(field.type)
            ?.properties.some((p) => p.name === filter.subFieldName))
      ) {
        throw new WorkflowStepExecutorException(
          'Unsupported group-by filter condition',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      }
      if (!isRecordFilterValueValid(filter))
        throw new WorkflowStepExecutorException(
          'Unresolved or empty group-by filter value',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
    }
    const filter = input.filter?.recordFilters
      ? computeRecordGqlOperationFilter({
          fieldMetadataItems: Object.values(
            flatFieldMetadataMaps.byUniversalIdentifier,
          ).filter(isDefined),
          recordFilters: input.filter.recordFilters as Parameters<
            typeof computeRecordGqlOperationFilter
          >[0]['recordFilters'],
          recordFilterGroups: input.filter.recordFilterGroups ?? [],
          filterValueDependencies: { timeZone: 'UTC' },
        })
      : (input.filter?.gqlOperationFilter ?? {});
    const output = await this.groupByRecordsService.execute({
      objectName: input.objectName,
      groupBy: input.groupBy as ObjectRecordGroupBy,
      aggregateOperation: input.aggregateOperation,
      aggregateFieldName: input.aggregateFieldName,
      limit: input.limit,
      orderBy: input.orderBy,
      filter,
      authContext: executionContext.authContext,
      rolePermissionConfig: executionContext.rolePermissionConfig,
    });
    return output.success
      ? { result: output.result }
      : { error: output.error ?? output.message };
  }
}
