import { useState } from 'react';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { type WorkflowGroupByRecordsAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { getGroupByRecordsFieldChoices } from '../utils/getGroupByRecordsFieldChoices';
import { WorkflowGroupByRecordsFilters } from './WorkflowGroupByRecordsFilters';

type WorkflowEditActionGroupByRecordsProps = {
  action: WorkflowGroupByRecordsAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowGroupByRecordsAction) => void;
      };
};

export const WorkflowEditActionGroupByRecords = ({
  action,
  actionOptions,
}: WorkflowEditActionGroupByRecordsProps) => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const [input, setInput] = useState(action.settings.input);
  const readonly = actionOptions.readonly === true;
  const object = objectMetadataItems.find(
    (o) => o.nameSingular === input.objectName,
  );
  const choices = getGroupByRecordsFieldChoices(object?.fields ?? []);
  const save = (next: typeof input) => {
    if (actionOptions.readonly === true) return;
    setInput(next);
    actionOptions.onActionUpdate({
      ...action,
      settings: { ...action.settings, input: next },
    });
  };
  const selectedDimensions = Array.isArray(input.groupBy) ? input.groupBy : [];
  const dimensionValue = (index: number) =>
    choices.dimensions.find(
      (d) =>
        JSON.stringify(d.definition) ===
        JSON.stringify(selectedDimensions[index]),
    )?.value ?? '';
  const operation = input.aggregateOperation ?? 'COUNT';
  const aggregateOptions = choices.aggregates.filter((a) =>
    a.operations.some((op) => op === operation),
  );
  const operations = [
    'COUNT',
    ...new Set(choices.aggregates.flatMap((a) => a.operations)),
  ];

  return (
    <>
      <WorkflowStepBody>
        <Select
          label="Object"
          dropdownId={`group-object-${action.id}`}
          disabled={readonly}
          value={input.objectName}
          options={objectMetadataItems.map((o) => ({
            value: o.nameSingular,
            label: o.labelPlural,
          }))}
          onChange={(objectName) =>
            save({
              objectName,
              groupBy: [],
              aggregateOperation: 'COUNT',
              limit: 200,
            })
          }
        />
        {[0, 1].map((index) => (
          <Select
            key={index}
            label={index === 0 ? 'Group by' : 'Second dimension (optional)'}
            dropdownId={`group-dimension-${action.id}-${index}`}
            disabled={readonly}
            value={dimensionValue(index)}
            options={[
              { value: '', label: 'None' },
              ...choices.dimensions.filter(
                (d) => d.value !== dimensionValue(1 - index),
              ),
            ]}
            onChange={(value) => {
              const dimension = choices.dimensions.find(
                (d) => d.value === value,
              );
              const groupBy = [...selectedDimensions];
              if (dimension) groupBy[index] = dimension.definition;
              else groupBy.splice(index, 1);
              save({ ...input, groupBy: groupBy.filter(Boolean) });
            }}
          />
        ))}
        <Select
          label="Aggregation"
          dropdownId={`group-operation-${action.id}`}
          disabled={readonly}
          value={operation}
          options={operations.map((value) => ({ value, label: value }))}
          onChange={(aggregateOperation) =>
            save({
              ...input,
              aggregateOperation,
              aggregateFieldName: undefined,
            })
          }
        />
        {operation !== 'COUNT' && (
          <Select
            label="Aggregate field"
            dropdownId={`group-field-${action.id}`}
            disabled={readonly}
            value={input.aggregateFieldName ?? ''}
            options={aggregateOptions.map(({ field }) => ({
              value:
                field.type === 'CURRENCY' &&
                ['SUM', 'AVG', 'MIN', 'MAX'].includes(operation)
                  ? `${field.name}.amountMicros`
                  : field.name,
              label:
                field.type === 'CURRENCY' &&
                ['SUM', 'AVG', 'MIN', 'MAX'].includes(operation)
                  ? `${field.label} / amountMicros`
                  : field.label,
            }))}
            onChange={(aggregateFieldName) =>
              save({ ...input, aggregateFieldName })
            }
          />
        )}
        {object && (
          <WorkflowGroupByRecordsFilters
            object={object}
            actionId={action.id}
            readonly={readonly}
            filter={input.filter}
            onChange={(filter) => save({ ...input, filter })}
          />
        )}
        <Select
          label="Order by aggregate"
          dropdownId={`group-order-${action.id}`}
          disabled={readonly}
          value={input.orderBy ?? 'DESC'}
          options={[
            { value: 'DESC', label: 'Descending' },
            { value: 'ASC', label: 'Ascending' },
          ]}
          onChange={(orderBy) => save({ ...input, orderBy })}
        />
        <FormNumberFieldInput
          label="Group limit"
          defaultValue={
            typeof input.limit === 'number' ? input.limit : undefined
          }
          readonly={readonly}
          hint="1–200 returned groups. Aggregation includes all matching source records."
          onChange={(limit) => {
            if (
              typeof limit === 'number' &&
              Number.isInteger(limit) &&
              limit > 0 &&
              limit <= 200
            )
              save({ ...input, limit });
          }}
        />
        <p>
          Currency aggregates retain amountMicros units. No currency conversion
          is performed. Add a currencyCode dimension to keep currencies
          separate. Check isComplete before using results as exhaustive totals.
        </p>
      </WorkflowStepBody>
      {!readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
