import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';
import { Provider, createStore } from 'jotai';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { TimelineViewSettings } from '@/object-record/record-index/components/TimelineViewSettings';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';

let canPersistChanges = true;
const updateCurrentView = jest.fn();
jest.mock('@/views/hooks/useCanPersistViewChanges', () => ({
  useCanPersistViewChanges: () => ({ canPersistChanges }),
}));
jest.mock('@/views/hooks/useUpdateCurrentView', () => ({
  useUpdateCurrentView: () => ({ updateCurrentView }),
}));
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));

const date = (id: string) => ({
  id,
  universalIdentifier: `${id}-universal`,
  label: id,
  name: id,
  type: 'DATE',
  isActive: true,
});
const source = {
  id: 'tasks',
  isActive: true,
  fields: [
    date('Start'),
    date('End'),
    date('Secret'),
    { ...date('Inactive'), isActive: false },
  ],
  readableFields: [
    date('Start'),
    date('End'),
    { ...date('Inactive'), isActive: false },
  ],
} as unknown as EnrichedObjectMetadataItem;
const configuration = {
  startDateFieldMetadataUniversalIdentifier: 'Start-universal',
  endDateFieldMetadataUniversalIdentifier: 'End-universal',
  barColor: ODELZA_THEME_LIGHT.color.blue,
};
const mount = () =>
  render(
    <Provider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <TimelineViewSettings
          instanceId="settings-test"
          objectMetadataItem={source}
          view={{ timelineConfiguration: configuration } as View}
        />
      </I18nProvider>
    </Provider>,
  );
beforeEach(() => {
  jest.clearAllMocks();
  canPersistChanges = true;
  updateCurrentView.mockResolvedValue(undefined);
});

it('offers only readable active date fields and persists universal mappings without dropping color', async () => {
  mount();
  fireEvent.click(screen.getByText('Start', { exact: true }));
  expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByText('End', { exact: true }).at(-1)!);
  await waitFor(() =>
    expect(updateCurrentView).toHaveBeenCalledWith({
      timelineConfiguration: {
        ...configuration,
        startDateFieldMetadataUniversalIdentifier: 'End-universal',
      },
    }),
  );
});

it('persists a custom hexadecimal color with the existing native color picker', async () => {
  mount();
  fireEvent.click(screen.getAllByRole('button', { name: /Bar color/ }).at(-1)!);
  expect(screen.getByPlaceholderText('Hex color')).toHaveValue(
    ODELZA_THEME_LIGHT.color.blue,
  );
  fireEvent.change(screen.getByPlaceholderText('Hex color'), {
    target: { value: ODELZA_THEME_LIGHT.color.turquoise },
  });
  await waitFor(() =>
    expect(updateCurrentView).toHaveBeenCalledWith({
      timelineConfiguration: {
        ...configuration,
        barColor: ODELZA_THEME_LIGHT.color.turquoise,
      },
    }),
  );
});

it('prevents persistence when the view is not writable', () => {
  canPersistChanges = false;
  mount();
  fireEvent.click(screen.getByText('Start', { exact: true }));
  expect(updateCurrentView).not.toHaveBeenCalled();
  expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
});

it('reloads saved universal mappings and custom color without persisting a second time', () => {
  const saved = {
    ...configuration,
    startDateFieldMetadataUniversalIdentifier: 'End-universal',
    barColor: ODELZA_THEME_LIGHT.color.turquoise,
  };
  render(
    <Provider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <TimelineViewSettings
          instanceId="reloaded"
          objectMetadataItem={source}
          view={{ timelineConfiguration: saved }}
        />
      </I18nProvider>
    </Provider>,
  );
  expect(screen.queryByText('Start', { exact: true })).not.toBeInTheDocument();
  expect(screen.getAllByText('End', { exact: true })).toHaveLength(2);
  fireEvent.click(screen.getAllByRole('button', { name: /Bar color/ }).at(-1)!);
  expect(screen.getByPlaceholderText('Hex color')).toHaveValue(
    ODELZA_THEME_LIGHT.color.turquoise,
  );
  expect(updateCurrentView).not.toHaveBeenCalled();
});

it.each([
  '',
  ODELZA_THEME_LIGHT.color.blue.slice(0, 4),
  '#12345g',
  '#1234567',
  'red',
])('rejects invalid color %j without persistence', (value) => {
  const before = JSON.stringify(configuration);
  mount();
  fireEvent.click(screen.getAllByRole('button', { name: /Bar color/ }).at(-1)!);
  fireEvent.change(screen.getByPlaceholderText('Hex color'), {
    target: { value },
  });
  expect(updateCurrentView).not.toHaveBeenCalled();
  expect(JSON.stringify(configuration)).toBe(before);
});

it('rechecks permission after opening color controls', () => {
  const mounted = mount();
  fireEvent.click(screen.getAllByRole('button', { name: /Bar color/ }).at(-1)!);
  canPersistChanges = false;
  mounted.rerender(
    <Provider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <TimelineViewSettings
          instanceId="settings-test"
          objectMetadataItem={source}
          view={{ timelineConfiguration: configuration } as View}
        />
      </I18nProvider>
    </Provider>,
  );
  const input = screen.queryByPlaceholderText('Hex color');
  if (input)
    fireEvent.change(input, {
      target: { value: ODELZA_THEME_LIGHT.color.turquoise },
    });
  expect(updateCurrentView).not.toHaveBeenCalled();
});
