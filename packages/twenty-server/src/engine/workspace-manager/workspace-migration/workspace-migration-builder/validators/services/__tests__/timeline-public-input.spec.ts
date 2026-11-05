import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';

describe('public timeline configuration boundaries', () => {
  const validate = (timelineConfiguration: unknown) =>
    validateSync(
      plainToInstance(UpdateViewInput, {
        id: '11111111-1111-4111-8111-111111111111',
        timelineConfiguration,
      }),
    );

  it.each([
    null,
    {},
    {
      startDateFieldMetadataUniversalIdentifier: null,
      endDateFieldMetadataUniversalIdentifier: null,
      barColor: null,
    },
    { barColor: '#aAbB09' },
  ])('accepts %j', (configuration) => {
    expect(validate(configuration)).toEqual([]);
  });

  it.each([
    'bad',
    { barColor: 'red' },
    { barColor: '#123' },
    { startDateFieldMetadataUniversalIdentifier: 'not-uuid' },
  ])('rejects %j', (configuration) => {
    const errors = validate(configuration);
    expect(errors.map(({ property }) => property)).toContain(
      'timelineConfiguration',
    );
  });
});
