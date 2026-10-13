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

  it('keeps completion and retry backoff separate when switching views', async () => {
    jest.useFakeTimers();
    const firstView = createCatalogView('switch-first');
    const secondView = createCatalogView('switch-second');
    mockPerformViewFieldAPICreate
      .mockResolvedValueOnce({ status: 'failed' })
      .mockResolvedValueOnce({ status: 'successful' })
      .mockResolvedValueOnce({ status: 'failed' })
      .mockResolvedValueOnce({ status: 'successful' });
    const { rerender } = renderHook(
      ({ view }) =>
        useMigrateCatalogViewFields({
          currentView: view,
          availableFieldMetadataIds: ['image-field-id'],
        }),
      { initialProps: { view: firstView } },
    );
    await act(async () => {});
    rerender({ view: secondView });
    await act(async () => {});
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(2);
    rerender({ view: firstView });
    await act(async () => {});
    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(3);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(3);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(4);
    rerender({ view: secondView });
    rerender({ view: firstView });
    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(4);
  });

  it.each(['pending', 'scheduled'])(
    'does not retry after unmount with a %s write',
    async (phase) => {
      jest.useFakeTimers();
      let finishCreate!: (result: { status: string }) => void;
      mockPerformViewFieldAPICreate.mockReturnValueOnce(
        new Promise((resolve) => {
          finishCreate = resolve;
        }),
      );
      const currentView = createCatalogView(`unmount-${phase}`);
      const { unmount } = renderHook(() =>
        useMigrateCatalogViewFields({
          currentView,
          availableFieldMetadataIds: ['image-field-id'],
        }),
      );
      if (phase === 'scheduled') {
        await act(async () => {
          finishCreate({ status: 'failed' });
        });
      }
      unmount();
      if (phase === 'pending') {
        await act(async () => {
          finishCreate({ status: 'failed' });
        });
      }
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });
      expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(1);
      // Unmount does not leave a global in-flight lock or instance retry state.
      await act(async () => {
        renderHook(() =>
          useMigrateCatalogViewFields({
            currentView,
            availableFieldMetadataIds: ['image-field-id'],
          }),
        );
      });
      expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(2);
    },
  );

  it('deduplicates mounted instances and ignores an old view completion for the current view', async () => {
    let finishCreate!: (result: { status: string }) => void;
    mockPerformViewFieldAPICreate.mockReturnValueOnce(
      new Promise((resolve) => {
        finishCreate = resolve;
      }),
    );
    const firstView = createCatalogView('concurrent-first');
    const secondView = createCatalogView('concurrent-second');
    const useTestMigration = ({ view }: { view: View }) =>
      useMigrateCatalogViewFields({
        currentView: view,
        availableFieldMetadataIds: ['image-field-id'],
      });
    const { rerender } = renderHook(useTestMigration, {
      initialProps: { view: firstView },
    });
    const other = renderHook(useTestMigration, {
      initialProps: { view: firstView },
    });
    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(1);
    other.unmount();
    rerender({ view: secondView });
    await act(async () => {
      finishCreate({ status: 'successful' });
    });
    rerender({ view: firstView });
    rerender({ view: secondView });
    expect(mockPerformViewFieldAPICreate).toHaveBeenCalledTimes(2);
    expect(
      mockPerformViewFieldAPICreate.mock.calls[1][0].inputs[0].viewId,
    ).toBe(secondView.id);
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
