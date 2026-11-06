import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { Select } from '@/ui/input/components/Select';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { type ComponentProps, useEffect, useState } from 'react';
import {
  recordUpdatePreconditionSchema,
  type RecordUpdatePrecondition,
} from 'twenty-shared/workflow';

type Field = ComponentProps<typeof FormFieldInput>['field'];

export const WorkflowUpdateRecordPrecondition = ({
  value,
  onChange,
  readonly,
  fields,
}: {
  value: RecordUpdatePrecondition | undefined;
  onChange: (value: RecordUpdatePrecondition | undefined) => void;
  readonly: boolean;
  fields: Field[];
}) => {
  const [advanced, setAdvanced] = useState(false);
  const [text, setText] = useState(value ? JSON.stringify(value, null, 2) : '');
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    setText(value ? JSON.stringify(value, null, 2) : '');
  }, [value]);
  const scalarFields = fields.filter((field) =>
    [
      'UUID',
      'TEXT',
      'NUMBER',
      'BOOLEAN',
      'DATE',
      'DATE_TIME',
      'SELECT',
    ].includes(field.type),
  );
  const entries = Object.entries(value ?? {});
  const [fieldName, predicate] = entries[0] ?? [];
  const simple =
    entries.length === 1 &&
    predicate !== null &&
    typeof predicate === 'object' &&
    !Array.isArray(predicate) &&
    Object.keys(predicate).length === 1 &&
    'eq' in predicate;
  const field = scalarFields.find(
    (candidate) => candidate.metadata.fieldName === fieldName,
  );
  const showAdvanced = advanced || (value !== undefined && (!simple || !field));

  return (
    <section aria-label="Update precondition">
      <p>
        Optional target-row condition. For cooperative CAS, capture a unique
        UUID guard before dependent reads and rotate it in this update.
      </p>
      {showAdvanced ? (
        <>
          <label htmlFor="update-precondition-json">
            Advanced precondition (JSON)
          </label>
          <textarea
            id="update-precondition-json"
            value={text}
            disabled={readonly}
            onChange={(event) => {
              if (readonly) return;
              setText(event.target.value);
              try {
                const parsed = recordUpdatePreconditionSchema.safeParse(
                  JSON.parse(event.target.value),
                );
                setInvalid(!parsed.success);
                if (parsed.success) onChange(parsed.data);
              } catch {
                setInvalid(true);
              }
            }}
          />
          {invalid && (
            <p role="alert">
              Enter a non-empty JSON condition. Field and operator permissions
              are validated when the workflow runs.
            </p>
          )}
        </>
      ) : (
        <>
          <Select
            dropdownId="workflow-update-record-guard-field"
            label="Guard field"
            value={fieldName ?? ''}
            options={scalarFields.map((candidate) => ({
              label: candidate.label,
              value: candidate.metadata.fieldName,
            }))}
            emptyOption={{ label: 'No condition', value: '' }}
            disabled={readonly}
            onChange={(name) => {
              if (!readonly)
                onChange(name ? { [name]: { eq: '' } } : undefined);
            }}
          />
          {field && (
            <FormFieldInput
              field={field}
              defaultValue={simple ? predicate.eq : ''}
              readonly={readonly}
              onChange={(expected) => {
                if (!readonly) onChange({ [fieldName]: { eq: expected } });
              }}
              onClear={() => {
                if (!readonly) onChange(undefined);
              }}
              VariablePicker={WorkflowVariablePicker}
            />
          )}
        </>
      )}
      <button
        type="button"
        disabled={readonly}
        onClick={() => {
          if (!readonly) setAdvanced(true);
        }}
      >
        Edit advanced condition
      </button>
      <button
        type="button"
        disabled={readonly || value === undefined}
        onClick={() => {
          if (!readonly) {
            setAdvanced(false);
            setInvalid(false);
            onChange(undefined);
          }
        }}
      >
        Remove condition
      </button>
    </section>
  );
};
