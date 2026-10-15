import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { UserContext } from '@/users/contexts/UserContext';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';

jest.mock('@/activities/emails/hooks/useOpenEmailInAppOrFallback', () => ({
  useOpenEmailInAppOrFallback: () => ({ openEmail: jest.fn(), loading: false }),
}));
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeMorphRelationGqlFieldName } from 'twenty-shared/utils';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordCatalogField } from '@/object-record/record-index/components/RecordCatalogField';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';

jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: jest.fn(),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: jest.fn(() => ({
    objectMetadataItems: [
      { id: 'task-id', nameSingular: 'task', fields: [] },
      { id: 'note-id', nameSingular: 'note', fields: [] },
    ],
  })),
}));
jest.mock('@/activities/hooks/useActivityTargetObjectRecords', () => ({
  useActivityTargetObjectRecords: () => ({ activityTargetObjectRecords: [] }),
}));
jest.mock('@/object-record/components/RecordChip', () => ({
  RecordChip: ({
    record,
    forceDisableClick,
  }: {
    record: { title: string };
    forceDisableClick: boolean;
  }) => <span data-click-disabled={forceDisableClick}>{record.title}</span>,
}));

const renderField = (
  type: FieldMetadataType,
  value: unknown,
  name = 'value',
  metadata: Record<string, unknown> = {},
  onClick?: () => void,
  recordFields: Record<string, unknown> = {},
) => {
  const store = createStore();
  store.set(recordStoreFamilyState.atomFamily('record'), {
    id: 'record',
    __typename: 'Example',
    [name]: value,
    ...recordFields,
  });
  const fieldMetadataItem = {
    id: 'field',
    name,
    type,
    settings: null,
    ...metadata,
  } as FieldMetadataItem;
  const fieldDefinition = {
    fieldMetadataId: 'field',
    label: 'Value',
    iconName: 'IconText',
    type,
    metadata: {
      fieldName: name,
      objectMetadataNameSingular: 'example',
      options: [],
      ...metadata,
    },
  } as FieldDefinition<FieldMetadata>;
  return render(
    <I18nProvider i18n={setupI18n({ locale: 'en', messages: { en: {} } })}>
      <Provider store={store}>
        <UserContext.Provider
          value={{
            dateFormat: DateFormat.DAY_FIRST,
            timeFormat: TimeFormat.HOUR_24,
            timeZone: 'UTC',
          }}
        >
          <SnackBarComponentInstanceContext.Provider
            value={{ instanceId: 'catalog-test' }}
          >
            <PreComputedChipGeneratorsContext.Provider
              value={{
                chipGeneratorPerObjectPerField: {},
                identifierChipGeneratorPerObject: {},
              }}
            >
              <div onClick={onClick}>
                <RecordCatalogField
                  recordId="record"
                  recordIndexId="index"
                  fieldDefinition={fieldDefinition}
                  fieldMetadataItem={fieldMetadataItem}
                />
              </div>
            </PreComputedChipGeneratorsContext.Provider>
          </SnackBarComponentInstanceContext.Provider>
        </UserContext.Provider>
      </Provider>
    </I18nProvider>,
  );
};

beforeEach(() => {
  (useObjectMetadataItems as jest.Mock).mockReturnValue({
    objectMetadataItems: [
      { id: 'task-id', nameSingular: 'task', fields: [] },
      { id: 'note-id', nameSingular: 'note', fields: [] },
    ],
  });
  (useRecordIndexContextOrThrow as jest.Mock).mockReturnValue({
    objectMetadataItem: { id: 'example-id', readableFields: [{ id: 'field' }] },
    objectPermissionsByObjectMetadataId: {},
  });
});

describe('RecordCatalogField native display', () => {
  it('does not display cached values of an unreadable source field', () => {
    (useRecordIndexContextOrThrow as jest.Mock).mockReturnValue({
      objectMetadataItem: { id: 'example-id', readableFields: [] },
      objectPermissionsByObjectMetadataId: {},
    });
    renderField(FieldMetadataType.TEXT, 'Private cached value');
    expect(screen.queryByText('Private cached value')).not.toBeInTheDocument();
    expect(screen.getByText('Not shared')).toBeInTheDocument();
  });

  it('does not display a denied relation target or its restricted identifier label', () => {
    (useObjectMetadataItems as jest.Mock).mockReturnValue({
      objectMetadataItems: [
        {
          id: 'task-id',
          nameSingular: 'task',
          labelIdentifierFieldMetadataId: 'title-id',
          readableFields: [],
          fields: [],
        },
      ],
    });
    renderField(
      FieldMetadataType.RELATION,
      { id: 'related', title: 'Private label' },
      'relation',
      {
        relation: { targetObjectMetadata: { id: 'task-id' } },
        relationType: RelationType.MANY_TO_ONE,
        relationObjectMetadataId: 'task-id',
        relationObjectMetadataNameSingular: 'task',
      },
    );
    expect(screen.queryByText('Private label')).not.toBeInTheDocument();
    expect(screen.getByText('Not shared')).toBeInTheDocument();
  });

  it('fails closed for a mixed morph field containing a denied target', () => {
    (useRecordIndexContextOrThrow as jest.Mock).mockReturnValue({
      objectMetadataItem: {
        id: 'example-id',
        readableFields: [{ id: 'field' }],
      },
      objectPermissionsByObjectMetadataId: {
        'task-id': { canReadObjectRecords: false },
      },
    });
    renderField(FieldMetadataType.MORPH_RELATION, undefined, 'mixedMorph', {
      relationType: RelationType.ONE_TO_MANY,
      morphRelations: [
        {
          type: RelationType.ONE_TO_MANY,
          sourceFieldMetadata: { name: 'mixedMorph' },
          targetObjectMetadata: {
            id: 'task-id',
            nameSingular: 'task',
            namePlural: 'tasks',
          },
        },
      ],
    });
    expect(screen.getByText('Not shared')).toBeInTheDocument();
  });

  it.each([
    [FieldMetadataType.TEXT, 'Visible text', 'Visible text'],
    [
      FieldMetadataType.UUID,
      '11111111-1111-4111-8111-111111111111',
      '11111111-1111-4111-8111-111111111111',
    ],
    [FieldMetadataType.NUMBER, 42, '42'],
    [FieldMetadataType.NUMBER, 0, '0'],
    [FieldMetadataType.BOOLEAN, false, 'False'],
    [
      FieldMetadataType.CURRENCY,
      { amountMicros: 42000000, currencyCode: 'USD' },
      '42',
    ],
    [FieldMetadataType.RAW_JSON, { safe: 'json' }, '{"safe":"json"}'],
    [FieldMetadataType.ARRAY, ['First', 'Second'], 'First'],
    [
      FieldMetadataType.EMAILS,
      {
        primaryEmail: 'ada@example.com',
        additionalEmails: ['other@example.com'],
      },
      'ada@example.com',
    ],
    [
      FieldMetadataType.LINKS,
      {
        primaryLinkUrl: 'https://example.com',
        primaryLinkLabel: 'Example',
        secondaryLinks: [],
      },
      'Example',
    ],
    [
      FieldMetadataType.FULL_NAME,
      { firstName: 'Ada', lastName: 'Lovelace' },
      'Ada Lovelace',
    ],
    [
      FieldMetadataType.RICH_TEXT,
      {
        blocknote: JSON.stringify([
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Safe rich text', styles: {} }],
          },
        ]),
      },
      'Safe rich text',
    ],
  ])(
    'renders %s through the real native field display',
    (type, value, expected) => {
      renderField(type as FieldMetadataType, value);
      expect(screen.getByText(expected as string)).toBeInTheDocument();
    },
  );

  it.each(['taskTargets', 'noteTargets'])(
    'unwraps nested %s without fetching per card',
    (name) => {
      const activity = name === 'taskTargets' ? 'task' : 'note';
      renderField(
        FieldMetadataType.RELATION,
        [
          {
            id: 'target',
            [activity]: { id: 'activity', title: 'Nested activity title' },
          },
        ],
        name,
        {
          relationType: RelationType.ONE_TO_MANY,
          relationObjectMetadataId: 'target-id',
          relationObjectMetadataNameSingular: `${activity}Target`,
        },
      );
      expect(screen.getByText('Nested activity title')).toHaveAttribute(
        'data-click-disabled',
        'false',
      );
    },
  );

  it.each([
    [
      FieldMetadataType.SELECT,
      'selected',
      { options: [{ value: 'selected', label: 'Selected', color: 'blue' }] },
    ],
    [
      FieldMetadataType.MULTI_SELECT,
      ['selected', 'other'],
      {
        options: [
          { value: 'selected', label: 'Selected', color: 'blue' },
          { value: 'other', label: 'Other', color: 'green' },
        ],
      },
    ],
    [
      FieldMetadataType.ADDRESS,
      {
        addressStreet1: 'Main Street',
        addressCity: 'London',
        addressCountry: 'UK',
      },
      {},
    ],
    [
      FieldMetadataType.PHONES,
      {
        primaryPhoneNumber: '2025550123',
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
        additionalPhones: [],
      },
      {},
    ],
    [FieldMetadataType.DATE, '2026-10-11', {}],
    [FieldMetadataType.DATE_TIME, '2026-10-11T12:00:00Z', {}],
    [
      FieldMetadataType.ACTOR,
      {
        source: 'MANUAL',
        name: 'Test actor',
        workspaceMemberId: null,
        context: null,
      },
      {},
    ],
    [
      FieldMetadataType.FILES,
      [
        {
          fileId: 'file-id',
          label: 'Document',
          extension: 'pdf',
          url: 'https://example.com/file.pdf',
        },
      ],
      {},
    ],
  ])(
    'mounts nonempty native %s output with read-only Catalog providers',
    (type, value, metadata) => {
      const { container } = renderField(
        type as FieldMetadataType,
        value,
        'value',
        metadata as Record<string, unknown>,
      );
      expect(container.textContent?.trim().length).toBeGreaterThan(0);
      expect(container.querySelector('input:not([disabled])')).toBeNull();
    },
  );

  it('renders rating as read-only native stars', () => {
    const { container } = renderField(FieldMetadataType.RATING, 3);
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
    expect(container.querySelector('input:not([disabled])')).toBeNull();
  });

  it.each([
    FieldMetadataType.NUMERIC,
    FieldMetadataType.POSITION,
    FieldMetadataType.TS_VECTOR,
  ])(
    'retains the native no-display contract for internal %s fields',
    (type) => {
      const { container } = renderField(type, 'Internal field value');
      expect(container.textContent).toBe('');
    },
  );

  it.each([RelationType.MANY_TO_ONE, RelationType.ONE_TO_MANY])(
    'renders native ordinary %s relations',
    (relationType) => {
      renderField(
        FieldMetadataType.RELATION,
        relationType === RelationType.MANY_TO_ONE
          ? { id: 'related', title: 'Related title' }
          : [{ id: 'related', title: 'Related title' }],
        'relation',
        {
          relationType,
          relationObjectMetadataId: 'task-id',
          relationObjectMetadataNameSingular: 'task',
        },
      );
      expect(screen.getByText('Related title')).toHaveAttribute(
        'data-click-disabled',
        'false',
      );
    },
  );

  it.each([RelationType.MANY_TO_ONE, RelationType.ONE_TO_MANY])(
    'renders native morph %s relations from projected store fields',
    (relationType) => {
      const name =
        relationType === RelationType.MANY_TO_ONE ? 'morphOne' : 'morphMany';
      const gqlName = computeMorphRelationGqlFieldName({
        fieldName: name,
        relationType,
        targetObjectMetadataNameSingular: 'task',
        targetObjectMetadataNamePlural: 'tasks',
      });
      const record = { id: 'related', title: 'Morph title' };
      renderField(
        FieldMetadataType.MORPH_RELATION,
        undefined,
        name,
        {
          relationType,
          morphRelations: [
            {
              type: relationType,
              sourceFieldMetadata: { name },
              targetObjectMetadata: {
                id: 'task-id',
                nameSingular: 'task',
                namePlural: 'tasks',
              },
            },
          ],
        },
        undefined,
        {
          [gqlName]:
            relationType === RelationType.MANY_TO_ONE ? record : [record],
          [`${gqlName}Id`]: record.id,
        },
      );
      expect(screen.getByText('Morph title')).toHaveAttribute(
        'data-click-disabled',
        'false',
      );
    },
  );

  it('blocks a denied activity object before native relation values render', () => {
    (useRecordIndexContextOrThrow as jest.Mock).mockReturnValue({
      objectMetadataItem: {
        id: 'example-id',
        readableFields: [{ id: 'field' }],
      },
      objectPermissionsByObjectMetadataId: {
        'task-id': { canReadObjectRecords: false },
      },
    });
    renderField(
      FieldMetadataType.RELATION,
      [{ id: 'target', task: { id: 'activity', title: 'Private title' } }],
      'taskTargets',
      {
        relationType: RelationType.ONE_TO_MANY,
        relationObjectMetadataId: 'target-id',
        relationObjectMetadataNameSingular: 'taskTarget',
      },
    );
    expect(screen.queryByText('Private title')).not.toBeInTheDocument();
  });

  it('does not bubble native field actions into card navigation', () => {
    const onClick = jest.fn();
    renderField(FieldMetadataType.TEXT, 'Field value', 'value', {}, onClick);
    fireEvent.click(screen.getByText('Field value'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
