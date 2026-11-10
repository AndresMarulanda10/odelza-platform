import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';

import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const CONDITIONAL_UPDATE_SAFE_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.UUID,
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
]);

export const validateConditionalUpdatePayload = (
  data: Record<string, unknown>,
  context: Pick<
    CommonBaseQueryRunnerContext,
    'flatObjectMetadata' | 'flatFieldMetadataMaps'
  >,
): void => {
  const fields = getFlatFieldsFromFlatObjectMetadata(
    context.flatObjectMetadata,
    context.flatFieldMetadataMaps,
  );
  for (const [name, value] of Object.entries(data)) {
    const field = fields.find((candidate) => candidate.name === name);
    if (
      !field ||
      name === 'id' ||
      !CONDITIONAL_UPDATE_SAFE_TYPES.has(field.type)
    ) {
      throw new CommonQueryRunnerException(
        'Conditional updates support scalar and safe composite fields only; files and relations are not supported',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        { userFriendlyMessage: msg`Unsupported conditional update field` },
      );
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const definition = compositeTypeDefinitions.get(field.type);
      if (
        !definition ||
        Object.entries(value).some(
          ([key, entry]) =>
            !definition.properties.some((property) => property.name === key) ||
            (entry !== null && typeof entry === 'object') ||
            typeof entry === 'function',
        )
      ) {
        throw new CommonQueryRunnerException(
          'Invalid conditional update composite value',
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: msg`Invalid conditional update value` },
        );
      }
    }
    if (typeof value === 'function') {
      throw new CommonQueryRunnerException(
        'SQL expressions are not supported',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        { userFriendlyMessage: msg`Invalid conditional update value` },
      );
    }
  }
};
