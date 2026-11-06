import { fireEvent, render, screen } from '@testing-library/react';
import { WorkflowEditActionGroupByRecords } from '../WorkflowEditActionGroupByRecords';

jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({
    objectMetadataItems: [
      {
        nameSingular: 'company',
        labelPlural: 'Companies',
        fields: [
          {
            name: 'status',
            label: 'Status',
            type: 'TEXT',
            isActive: true,
            isSystem: false,
          },
          {
            name: 'amount',
            label: 'Amount',
            type: 'CURRENCY',
            isActive: true,
            isSystem: false,
          },
        ],
      },
    ],
  }),
}));
jest.mock('@/ui/input/components/Select', () => ({
  Select: ({ label, disabled, value, options, onChange }: any) => (
    <select
      aria-label={label}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" />
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));
jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput',
  () => ({
    FormNumberFieldInput: ({
      label,
      readonly,
      defaultValue,
      onChange,
    }: any) => (
      <input
        aria-label={label}
        disabled={readonly}
        defaultValue={defaultValue}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    ),
  }),
);
jest.mock('@/workflow/workflow-steps/components/WorkflowStepBody', () => ({
  WorkflowStepBody: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/workflow/workflow-steps/components/WorkflowStepFooter', () => ({
  WorkflowStepFooter: () => <div>Footer</div>,
}));
jest.mock('../WorkflowGroupByRecordsFilters', () => ({
  WorkflowGroupByRecordsFilters: () => <div>Filters</div>,
}));

describe('WorkflowEditActionGroupByRecords', () => {
  const action = {
    id: 'group',
    type: 'GROUP_BY_RECORDS',
    settings: {
      input: {
        objectName: 'company',
        groupBy: [{ status: true }],
        aggregateOperation: 'COUNT',
        limit: 200,
      },
    },
  };
  it('persists dimensions, operation, money component, and limit on change', () => {
    const onActionUpdate = jest.fn();
    render(
      <WorkflowEditActionGroupByRecords
        action={action as never}
        actionOptions={{ onActionUpdate }}
      />,
    );
    fireEvent.change(screen.getByLabelText('Second dimension (optional)'), {
      target: { value: 'amount.currencyCode' },
    });
    expect(onActionUpdate.mock.lastCall[0].settings.input.groupBy).toEqual([
      { status: true },
      { amount: { currencyCode: true } },
    ]);
    fireEvent.change(screen.getByLabelText('Aggregation'), {
      target: { value: 'SUM' },
    });
    const field = screen.getByLabelText('Aggregate field');
    expect(field.textContent).not.toContain('Status');
    fireEvent.change(field, { target: { value: 'amount.amountMicros' } });
    expect(
      onActionUpdate.mock.lastCall[0].settings.input.aggregateFieldName,
    ).toBe('amount.amountMicros');
    fireEvent.change(screen.getByLabelText('Group limit'), {
      target: { value: '10' },
    });
    expect(onActionUpdate.mock.lastCall[0].settings.input.limit).toBe(10);
  });
  it('disables all controls and hides the footer in readonly mode', () => {
    render(
      <WorkflowEditActionGroupByRecords
        action={action as never}
        actionOptions={{ readonly: true }}
      />,
    );
    for (const element of screen.getAllByRole('combobox'))
      expect(element).toBeDisabled();
    expect(screen.getByLabelText('Group limit')).toBeDisabled();
    expect(screen.queryByText('Footer')).not.toBeInTheDocument();
  });
});
