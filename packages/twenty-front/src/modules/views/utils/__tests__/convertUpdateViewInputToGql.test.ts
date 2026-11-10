import { convertUpdateViewInputToGql } from '@/views/utils/convertUpdateViewInputToGql';

describe('saved timeline configuration updates', () => {
  it('strips response-only typenames and preserves explicit null clearing', () => {
    const configuration = {
      __typename: 'ViewTimelineConfiguration' as const,
      startDateFieldMetadataUniversalIdentifier: 'start-universal',
      endDateFieldMetadataUniversalIdentifier: 'end-universal',
      barColor: null,
    };
    expect(
      convertUpdateViewInputToGql({ timelineConfiguration: configuration }),
    ).toEqual({
      id: undefined,
      timelineConfiguration: {
        startDateFieldMetadataUniversalIdentifier: 'start-universal',
        endDateFieldMetadataUniversalIdentifier: 'end-universal',
        barColor: null,
      },
    });
    expect(
      convertUpdateViewInputToGql({ timelineConfiguration: null }),
    ).toEqual({ id: undefined, timelineConfiguration: null });
  });

  it('preserves existing updates and omits an unspecified timeline configuration', () => {
    expect(
      convertUpdateViewInputToGql({ name: 'Delivery', isCompact: false }),
    ).toEqual({ id: undefined, name: 'Delivery', isCompact: false });
  });
});
