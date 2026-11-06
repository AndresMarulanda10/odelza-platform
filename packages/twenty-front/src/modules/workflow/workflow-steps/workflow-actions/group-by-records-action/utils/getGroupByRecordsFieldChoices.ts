import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import {
  isFieldMetadataDateKind,
  isFieldMetadataSupportedInGroupBy,
} from 'twenty-shared/utils';

export const getGroupByRecordsFieldChoices = (fields: FieldMetadataItem[]) => {
  const active = fields.filter((field) => field.isActive);
  const dimensions = active.flatMap<{
    value: string;
    label: string;
    definition: Record<string, true | Record<string, string | true>>;
  }>((field) => {
    if (
      !isFieldMetadataSupportedInGroupBy({
        ...field,
        isSystem: field.isSystem ?? false,
      })
    )
      return [];
    if (field.type === 'RELATION' || field.type === 'MORPH_RELATION') {
      return field.settings?.relationType === 'MANY_TO_ONE'
        ? [
            {
              value: `${field.name}Id`,
              label: field.label,
              definition: { [`${field.name}Id`]: true },
            },
          ]
        : [];
    }
    if (isFieldMetadataDateKind(field.type))
      return [
        {
          value: field.name,
          label: `${field.label} (month, UTC)`,
          definition: {
            [field.name]: { granularity: 'MONTH', timeZone: 'UTC' },
          },
        },
      ];
    const composite = compositeTypeDefinitions.get(
      field.type as FieldMetadataType,
    );
    if (composite)
      return composite.properties
        .filter((p) => !p.hidden && p.type !== FieldMetadataType.RAW_JSON)
        .map((p) => ({
          value: `${field.name}.${p.name}`,
          label: `${field.label} / ${p.name}`,
          definition: { [field.name]: { [p.name]: true } },
        }));
    return [
      {
        value: field.name,
        label: field.label,
        definition: { [field.name]: true },
      },
    ];
  });
  const aggregates = active
    .filter((f) => f.type !== 'RELATION' && f.type !== 'MORPH_RELATION')
    .map((field) => ({
      field,
      operations: getAvailableAggregateOperationsForFieldMetadataType({
        fieldMetadataType: field.type,
      }).filter((op) => op !== 'COUNT'),
    }));
  return { dimensions, aggregates };
};
