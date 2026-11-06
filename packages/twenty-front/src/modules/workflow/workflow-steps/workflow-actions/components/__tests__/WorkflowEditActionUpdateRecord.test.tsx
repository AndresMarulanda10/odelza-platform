import { act, fireEvent, render, screen } from '@testing-library/react';
import { WorkflowEditActionUpdateRecord } from '../WorkflowEditActionUpdateRecord';
import { type WorkflowUpdateRecordAction } from '@/workflow/types/Workflow';

jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({
    activeNonSystemObjectMetadataItems: ['widget', 'other'].map((name) => ({
      nameSingular: name,
      labelPlural: name,
      fields: ['data', 'precondition'].map((field) => ({
        id: field,
        name: field,
        type: 'TEXT',
      })),
    })),
  }),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataSelectHelpers', () => ({
  useObjectMetadataSelectHelpers: () => ({
    getSelectIconPropsFromObjectMetadataItem: () => ({}),
  }),
}));
jest.mock(
  '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition',
  () => ({
    formatFieldMetadataItemAsFieldDefinition: ({ field }: any) => ({
      type: 'TEXT',
      label: field.name,
      metadata: { fieldName: field.name },
    }),
  }),
);
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField',
  () => ({ shouldDisplayFormField: () => true }),
);
jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: ({ field, defaultValue, onChange, readonly }: any) => (
    <input
      aria-label={field.metadata.fieldName}
      value={defaultValue ?? ''}
      disabled={readonly}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));
jest.mock('@/ui/input/components/Select', () => ({
  Select: ({ label, value, options, onChange, disabled }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker',
  () => ({ FormSingleRecordPicker: () => null }),
);
jest.mock(
  '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect',
  () => ({ WorkflowFieldsMultiSelect: () => null }),
);
jest.mock(
  '@/workflow/workflow-variables/components/WorkflowVariablePicker',
  () => ({ WorkflowVariablePicker: () => null }),
);
jest.mock('@/workflow/workflow-steps/components/WorkflowStepBody', () => ({
  WorkflowStepBody: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/workflow/workflow-steps/components/WorkflowStepFooter', () => ({
  WorkflowStepFooter: () => null,
}));
jest.mock('twenty-ui/layout', () => ({ HorizontalSeparator: () => null }));

describe('update-record editor condition isolation', () => {
  const condition = {
    and: [{ guard: { eq: 'captured' } }, { count: { gt: 0 } }],
  };
  const action = {
    id: 'step',
    type: 'UPDATE_RECORD',
    settings: {
      input: {
        objectName: 'widget',
        objectRecordId: 'record',
        fieldsToUpdate: ['data', 'precondition'],
        objectRecord: { data: 'custom-data', precondition: 'custom-condition' },
        precondition: condition,
      },
    },
  } as unknown as WorkflowUpdateRecordAction;
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  it('preserves advanced conditions when unrelated custom record fields save', () => {
    const onActionUpdate = jest.fn();
    render(
      <WorkflowEditActionUpdateRecord
        action={action}
        actionOptions={{ onActionUpdate }}
      />,
    );
    fireEvent.change(screen.getByLabelText('data'), {
      target: { value: 'edited-data' },
    });
    act(() => jest.advanceTimersByTime(1100));
    expect(onActionUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          input: expect.objectContaining({
            precondition: condition,
            objectRecord: {
              data: 'edited-data',
              precondition: 'custom-condition',
            },
          }),
        }),
      }),
    );
  });
  it('clears the condition on object changes rather than reinterpreting it as record data', () => {
    const onActionUpdate = jest.fn();
    render(
      <WorkflowEditActionUpdateRecord
        action={action}
        actionOptions={{ onActionUpdate }}
      />,
    );
    fireEvent.change(screen.getByLabelText('Object'), {
      target: { value: 'other' },
    });
    act(() => jest.advanceTimersByTime(1100));
    const input = onActionUpdate.mock.calls[0][0].settings.input;
    expect(input.objectName).toBe('other');
    expect(input).not.toHaveProperty('precondition');
    expect(input.objectRecord).toEqual({});
  });
});
