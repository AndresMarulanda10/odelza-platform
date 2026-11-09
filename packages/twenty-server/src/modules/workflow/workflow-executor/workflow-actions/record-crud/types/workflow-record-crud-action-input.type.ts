export type { CreateRecordInput as WorkflowCreateRecordActionInput } from 'src/engine/core-modules/record-crud/types/record-crud-input.type';
export type { UpdateRecordInput as WorkflowUpdateRecordActionInput } from 'src/engine/core-modules/record-crud/types/record-crud-input.type';
export type { DeleteRecordInput as WorkflowDeleteRecordActionInput } from 'src/engine/core-modules/record-crud/types/record-crud-input.type';
import { type FindRecordsInput } from 'src/engine/core-modules/record-crud/types/record-crud-input.type';

export type WorkflowFindRecordsActionInput = Omit<
  FindRecordsInput,
  'limit' | 'offset'
> & {
  limit?: number | string;
  offset?: number | string;
  after?: string;
};
export type { UpsertRecordInput as WorkflowUpsertRecordActionInput } from 'src/engine/core-modules/record-crud/types/record-crud-input.type';
import { type z } from 'zod';
import { type workflowGroupByRecordsInputSchema } from 'twenty-shared/workflow';

export type WorkflowGroupByRecordsActionInput = z.infer<
  typeof workflowGroupByRecordsInputSchema
>;
