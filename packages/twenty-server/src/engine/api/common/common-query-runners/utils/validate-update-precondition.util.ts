import { msg } from '@lingui/core/macro';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
  type ObjectsPermissions,
} from 'twenty-shared/types';
import { recordUpdatePreconditionSchema } from 'twenty-shared/workflow';

import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

const invalid = (): never => {
  throw new CommonQueryRunnerException(
    'Invalid precondition: use non-empty comparisons on readable target-row fields',
    CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
    { userFriendlyMessage: msg`Invalid update precondition` },
  );
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// These types have no relation traversal, file enrichment, or arbitrary JSON
// operators. Native filter processing still validates each operator/value type.
const scalarTypes = new Set<FieldMetadataType>([
  FieldMetadataType.UUID,
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.SELECT,
]);
const compositeTypes = new Set<FieldMetadataType>([
  FieldMetadataType.CURRENCY,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
]);

export const validateUpdatePrecondition = (
  value: unknown,
  context: Pick<
    CommonBaseQueryRunnerContext,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  >,
  permissions: ObjectsPermissions,
  bypassReadPermissions = false,
): ObjectRecordFilter => {
  const parsed = recordUpdatePreconditionSchema.safeParse(value);
  if (!parsed.success) return invalid();
  const fields = getFlatFieldsFromFlatObjectMetadata(
    context.flatObjectMetadata,
    context.flatFieldMetadataMaps,
  );
  const permission = permissions[context.flatObjectMetadata.id];
  if (!bypassReadPermissions && !permission?.canReadObjectRecords)
    return invalid();
  let leaves = 0;
  const visitComparison = (comparison: unknown) => {
    if (!isObject(comparison) || Object.keys(comparison).length !== 1)
      return invalid();
    const [[operator, operand]] = Object.entries(comparison);
    if (!['eq', 'gt', 'gte', 'lt', 'lte', 'in'].includes(operator))
      return invalid();
    const operands = operator === 'in' ? operand : [operand];
    if (
      !Array.isArray(operands) ||
      operands.length === 0 ||
      operands.length > 100
    )
      return invalid();
    if (
      operands.some(
        (entry) =>
          entry === null ||
          !['string', 'number', 'boolean'].includes(typeof entry),
      )
    )
      return invalid();
    leaves++;
    if (leaves > 100) return invalid();
  };
  const visit = (node: unknown, depth: number) => {
    if (depth > 10 || !isObject(node) || Object.keys(node).length === 0)
      return invalid();
    for (const [name, predicate] of Object.entries(node)) {
      if (name === 'and' || name === 'or') {
        if (
          !Array.isArray(predicate) ||
          predicate.length === 0 ||
          predicate.length > 100
        )
          return invalid();
        predicate.forEach((child) => visit(child, depth + 1));
        continue;
      }
      const field = fields.find((candidate) => candidate.name === name);
      if (
        !field ||
        (!bypassReadPermissions &&
          permission?.restrictedFields[field.id]?.canRead === false)
      )
        return invalid();
      if (scalarTypes.has(field.type)) {
        visitComparison(predicate);
      } else if (compositeTypes.has(field.type)) {
        const definition = compositeTypeDefinitions.get(field.type);
        if (
          !definition ||
          !isObject(predicate) ||
          Object.keys(predicate).length === 0
        )
          return invalid();
        for (const [subfield, comparison] of Object.entries(predicate)) {
          if (
            !definition.properties.some(
              (property) => property.name === subfield,
            )
          )
            return invalid();
          visitComparison(comparison);
        }
      } else return invalid();
    }
  };
  visit(parsed.data, 0);
  if (leaves === 0) return invalid();
  return parsed.data as ObjectRecordFilter;
};
