export const PERSONAL_FINANCE_SOURCE_FIELD_MAPPINGS = [
  ['incomeFieldMetadataId', 'incomeFieldMetadataUniversalIdentifier'],
  ['expenseFieldMetadataId', 'expenseFieldMetadataUniversalIdentifier'],
  ['budgetFieldMetadataId', 'budgetFieldMetadataUniversalIdentifier'],
  ['assetFieldMetadataId', 'assetFieldMetadataUniversalIdentifier'],
  ['liabilityFieldMetadataId', 'liabilityFieldMetadataUniversalIdentifier'],
  ['dateFieldMetadataId', 'dateFieldMetadataUniversalIdentifier'],
  ['categoryFieldMetadataId', 'categoryFieldMetadataUniversalIdentifier'],
] as const;

export type PersonalFinanceSourceMappingUniversal = {
  [P in (typeof PERSONAL_FINANCE_SOURCE_FIELD_MAPPINGS)[number][1]]?:
    | string
    | null;
};
