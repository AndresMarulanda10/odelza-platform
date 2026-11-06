import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { CONDITIONAL_UPDATE_SAFE_TYPES } from 'src/engine/api/common/common-query-runners/utils/validate-conditional-update-payload.util';
import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';
import { conditionalUpdateRecordInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/conditional-update-record-input.zod-schema';

export const generateConditionalUpdateRecordInputSchema = (
  metadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
) =>
  conditionalUpdateRecordInputSchema.extend({
    data: generateRecordPropertiesZodSchema(
      {
        ...metadata,
        fields: metadata.fields.filter((field) =>
          CONDITIONAL_UPDATE_SAFE_TYPES.has(field.type),
        ),
      },
      false,
      restrictedFields,
    )
      .partial()
      .strict(),
  });
