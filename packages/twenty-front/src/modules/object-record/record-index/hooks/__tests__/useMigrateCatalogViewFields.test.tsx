import { act, renderHook } from '@testing-library/react';

import { useMigrateCatalogViewFields } from '@/object-record/record-index/hooks/useMigrateCatalogViewFields';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';

const mockPerformViewFieldAPICreate = jest.fn();
let mockCanPersistChanges = true;

jest.mock('@/views/hooks/useCanPersistViewChanges', () => ({
  useCanPersistViewChanges: () => ({
    canPersistChanges: mockCanPersistChanges,
  }),
}));

jest.mock('@/views/hooks/internal/usePerformViewFieldAPIPersist', () => ({
  usePerformViewFieldAPIPersist: () => ({
    performViewFieldAPICreate: mockPerformViewFieldAPICreate,
  }),
}));

const createCatalogView = (id: string): View =>
  ({
    id,
    type: ViewType.CATALOG,
    viewFields: [],
    catalogImageFieldMetadataId: 'image-field-id',
    catalogSubtitleFieldMetadataId: 'subtitle-field-id',
    catalogDetailFieldMetadataId: 'detail-field-id',
  }) as unknown as View;

describe('useMigrateCatalogViewFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanPersistChanges = true;
    mockPerformViewFieldAPICreate.mockResolvedValue({ status: 'successful' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds missing role fields without changing compatibility metadata', async () => {
    const currentView = {
      ...createCatalogView('catalog-create-view'),
      viewFields: [
        {
          id: 'hidden-subtitle-view-field-id',
          fieldMetadataId: 'subtitle-field-id',
          position: 2,
          isActive: true,
          isVisible: false,
          size: 175,
        },
      ],
    } as View;

    await act(async () => {
      renderHook(() =>
        useMigrateCatalogViewFields({
          currentView,
          availableFieldMetadataIds: [
            'image-field-id',
            'subtitle-field-id',
            'detail-field-id',
          ],
        }),
      );
    });

    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledWith({
      inputs: expect.arrayContaining([
        expect.objectContaining({
          fieldMetadataId: 'image-field-id',
          isVisible: true,
          viewId: 'catalog-create-view',
        }),
        expect.objectContaining({
          fieldMetadataId: 'detail-field-id',
          isVisible: true,
          viewId: 'catalog-create-view',
        }),
      ]),
    });
    expect(mockPerformViewFieldAPICreate.mock.calls[0][0].inputs).toHaveLength(
      2,
    );
    expect(currentView.catalogImageFieldMetadataId).toBe('image-field-id');
    expect(currentView.catalogSubtitleFieldMetadataId).toBe(
      'subtitle-field-id',
    );
    expect(currentView.catalogDetailFieldMetadataId).toBe('detail-field-id');
  });

  it('does not attempt migration when the user cannot persist view changes', async () => {
    mockCanPersistChanges = false;
    const currentView = createCatalogView('catalog-no-permission-view');

    await act(async () => {
      renderHook(() =>
        useMigrateCatalogViewFields({
          currentView,
          availableFieldMetadataIds: ['image-field-id'],
        }),
      );
    });

    expect(mockPerformViewFieldAPICreate).not.toHaveBeenCalled();
    expect(currentView.catalogImageFieldMetadataId).toBe('image-field-id');
  });

  it('retries a failed write successfully without remounting', async () => {
    jest.useFakeTimers();
    mockPerformViewFieldAPICreate
      .mockResolvedValueOnce({
        status: 'failed',
        error: new Error('write failed'),
      })
      .mockResolvedValueOnce({ status: 'successful' });
    const currentView = createCatalogView('catalog-retry-view');

    await act(async () => {
      renderHook(() =>
        useMigrateCatalogViewFields({
          currentView,
          availableFieldMetadataIds: ['image-field-id'],
        }),
      );
      await Promise.resolve();
    });

    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(2);
    expect(currentView.catalogImageFieldMetadataId).toBe('image-field-id');
  });

  it('prevents a second concurrent create while the first write is pending', async () => {
    let finishCreate: ((result: { status: 'successful' }) => void) | undefined;
    mockPerformViewFieldAPICreate.mockReturnValue(
      new Promise((resolve) => {
        finishCreate = resolve;
      }),
    );
    const currentView = createCatalogView('catalog-in-flight-view');

    const { rerender } = renderHook(
      ({ view }) =>
        useMigrateCatalogViewFields({
          currentView: view,
          availableFieldMetadataIds: ['image-field-id'],
        }),
      { initialProps: { view: currentView } },
    );

    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(1);

    rerender({ view: { ...currentView } });

    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishCreate?.({ status: 'successful' });
      await Promise.resolve();
    });
  });

  it('does not migrate legacy roles for non-Catalog views', async () => {
    const currentView = {
      ...createCatalogView('table-view'),
      type: ViewType.TABLE,
    } as View;

    await act(async () => {
      renderHook(() =>
        useMigrateCatalogViewFields({
          currentView,
          availableFieldMetadataIds: ['image-field-id'],
        }),
      );
    });

    expect(mockPerformViewFieldAPICreate).not.toHaveBeenCalled();
  });
});
