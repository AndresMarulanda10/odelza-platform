import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { FlatViewFilterValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-filter-validator.service';

describe('native before-today view-filter operand validation', () => {
  const validator = new FlatViewFilterValidatorService();

  it.each([
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
    FieldMetadataType.TEXT,
    FieldMetadataType.SELECT,
  ])(
    'checks compatibility with %s without mutating input or throwing',
    (fieldType) => {
      const input = Object.freeze({
        operand: ViewFilterOperand.IS_BEFORE_TODAY,
        fieldType,
        subFieldName: undefined,
        relationTargetFieldType: undefined,
      });
      // Exercise the compatibility rule used by both create and update validation.
      const error = validator['getIncompatibleOperandError'](input);
      if (fieldType === FieldMetadataType.DATE_TIME) {
        expect(error).toBeUndefined();
      } else {
        expect(error).toMatchObject({ code: 'INVALID_VIEW_FILTER_DATA' });
      }
      expect(input.operand).toBe(ViewFilterOperand.IS_BEFORE_TODAY);
    },
  );
});
