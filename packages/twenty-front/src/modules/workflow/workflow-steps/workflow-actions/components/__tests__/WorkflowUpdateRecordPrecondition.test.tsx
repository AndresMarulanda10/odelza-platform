import { fireEvent, render, screen } from '@testing-library/react';
import { WorkflowUpdateRecordPrecondition } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowUpdateRecordPrecondition';

jest.mock('@/ui/input/components/Select', () => ({
  Select: ({ label, value, options, onChange, disabled, emptyOption }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{emptyOption?.label}</option>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: ({ defaultValue, onChange, readonly }: any) => (
    <input
      aria-label="Expected guard"
      value={defaultValue ?? ''}
      disabled={readonly}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));
jest.mock(
  '@/workflow/workflow-variables/components/WorkflowVariablePicker',
  () => ({ WorkflowVariablePicker: () => null }),
);

describe('WorkflowUpdateRecordPrecondition', () => {
  const fields = [
    { type: 'UUID', label: 'Guard', metadata: { fieldName: 'guard' } },
  ] as never;
  it('edits a simple guard through the field input without executing bindings', () => {
    const onChange = jest.fn();
    render(
      <WorkflowUpdateRecordPrecondition
        fields={fields}
        value={{ guard: { eq: 'captured' } }}
        onChange={onChange}
        readonly={false}
      />,
    );
    fireEvent.change(screen.getByLabelText('Expected guard'), {
      target: { value: '{{trigger.guard}}' },
    });
    expect(onChange).toHaveBeenCalledWith({
      guard: { eq: '{{trigger.guard}}' },
    });
  });
  it('preserves advanced predicates and does not save invalid JSON', () => {
    const onChange = jest.fn();
    const value = {
      and: [
        { guard: { eq: 'captured' } },
        { amount: { amountMicros: { gt: 0 } } },
      ],
    };
    render(
      <WorkflowUpdateRecordPrecondition
        fields={fields}
        value={value}
        onChange={onChange}
        readonly={false}
      />,
    );
    expect(
      JSON.parse(
        (
          screen.getByLabelText(
            'Advanced precondition (JSON)',
          ) as HTMLTextAreaElement
        ).value,
      ),
    ).toEqual(value);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Advanced precondition (JSON)'), {
      target: { value: '{' },
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
  it('does not edit or remove a read-only condition', () => {
    const onChange = jest.fn();
    render(
      <WorkflowUpdateRecordPrecondition
        fields={fields}
        value={{ guard: { eq: 'captured' } }}
        onChange={onChange}
        readonly
      />,
    );
    expect(screen.getByLabelText('Expected guard')).toBeDisabled();
    fireEvent.click(screen.getByText('Remove condition'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
