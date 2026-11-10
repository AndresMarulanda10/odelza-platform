import { renderHook, render } from '@testing-library/react';
import { useTimelineData } from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';
import { TaskTimeline } from '@/page-layout/widgets/task-timeline/components/TaskTimelineWidget';
import { FieldMetadataType } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
jest.mock(
  '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar',
  () => ({
    ...jest.requireActual(
      '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar',
    ),
    getTaskTimelineToday: () => '2026-11-01',
  }),
);
const original = getMockObjectMetadataItemOrThrow('task');
const date = (id: string, name: string) => ({
  ...original.fields[0],
  id,
  name,
  universalIdentifier: id,
  isActive: true,
  type: FieldMetadataType.DATE,
});
const start = date('s', 'startDate'),
  end = date('e', 'dueAt');
const task = {
  ...original,
  fields: [start, end],
  readableFields: [start, end],
};
let mockActive = true,
  mockRead = true,
  mockUpdate = true;
const mockQuery = jest.fn();
const mockWrite = jest.fn();
const records = [
  {
    id: 'record',
    title: 'Private title',
    startDate: '2026-11-01',
    dueAt: '2026-11-03',
  },
];
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      { ...task, isActive: mockActive },
      getMockObjectMetadataItemOrThrow('company'),
    ],
  }),
}));
jest.mock(
  '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject',
  () => ({
    useGenerateDepthRecordGqlFieldsFromObject: () => ({
      recordGqlFields: { id: true },
    }),
  }),
);
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({
    canReadObjectRecords: mockRead,
    canUpdateObjectRecords: mockUpdate,
    restrictedFields: {},
  }),
}));
jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (options: any) => {
    mockQuery(options);
    return { records, loading: false, refetch: jest.fn() };
  },
}));
jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockWrite }),
}));
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel: jest.fn() }),
}));
it('S2: revocation and inactive sources never expose cached data or write rejected edits', async () => {
  const wrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems: [task, getMockObjectMetadataItemOrThrow('company')],
  });
  const { result, rerender } = renderHook(
    () =>
      useTimelineData({
        sourceObjectMetadataId: task.id,
        fieldMapping: {
          startDateFieldMetadataId: 's',
          dueDateFieldMetadataId: 'e',
        },
        requireConfiguredDates: true,
      }),
    { wrapper },
  );
  const before = JSON.stringify(records);
  expect(result.current.canEditDates).toBe(true);
  mockUpdate = false;
  rerender();
  await expect(
    result.current.updateTask!({ taskId: 'record', startDate: '2026-11-02' }),
  ).rejects.toThrow('Task timeline editing is unavailable');
  expect(mockWrite).not.toHaveBeenCalled();
  expect(JSON.stringify(records)).toBe(before);
  mockRead = false;
  rerender();
  expect(result.current.status).toBe('forbidden');
  expect(result.current.items).toEqual([]);
  expect(mockQuery.mock.calls.at(-1)[0].skip).toBe(true);
  mockRead = true;
  mockActive = false;
  rerender();
  expect(result.current.items).toEqual([]);
  expect(result.current.canEditDates).toBe(false);
  expect(mockQuery.mock.calls.at(-1)[0].skip).toBe(true);
  expect(JSON.stringify(records)).toBe(before);
});
it('S2: two widgets and native timeline have unique public description targets', () => {
  const data = {
    status: 'ready' as const,
    items: [
      {
        id: 'record',
        title: 'Shared',
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        progress: null,
        isMilestone: false,
        dependencies: [],
        conflict: true,
      },
    ],
    hasConfigurationGap: false,
    retry: jest.fn(),
  };
  const { container } = render(
    <>
      {[
        'view-timeline-widget-one',
        'view-timeline-widget-two',
        'tasks-shared',
      ].map((instanceId) => (
        <TaskTimeline key={instanceId} instanceId={instanceId} data={data} />
      ))}
    </>,
  );
  const ids = Array.from(container.querySelectorAll('[id]')).map((el) => el.id);
  expect(new Set(ids).size).toBe(ids.length);
  const descriptions = Array.from(
    container.querySelectorAll('[aria-describedby]'),
  ).map((el) => el.getAttribute('aria-describedby')!);
  expect(descriptions.length).toBeGreaterThanOrEqual(3);
  for (const id of descriptions)
    expect(container.querySelector(`[id="${id}"]`)).not.toBeNull();
});
