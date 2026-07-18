import { act, renderHook } from '@testing-library/react';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { viewableRecordIdState } from '@/object-record/record-side-panel/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-side-panel/states/viewableRecordNameSingularState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockCreateOneNote = jest.fn();
const mockCreateOneNoteTarget = jest.fn();
const mockCreateOneTask = jest.fn();
const mockCreateOneTaskTarget = jest.fn();

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) => {
    switch (objectNameSingular) {
      case CoreObjectNameSingular.NoteTarget:
        return { createOneRecord: mockCreateOneNoteTarget };
      case CoreObjectNameSingular.Task:
        return { createOneRecord: mockCreateOneTask };
      case CoreObjectNameSingular.TaskTarget:
        return { createOneRecord: mockCreateOneTaskTarget };
      default:
        return { createOneRecord: mockCreateOneNote };
    }
  },
}));

const mockOpenRecordInSidePanel = jest.fn();

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: mockOpenRecordInSidePanel,
  }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const fakeNoteId = 'fake-note-id';
const fakeTaskId = 'fake-task-id';

describe('useOpenCreateActivityDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateOneNote.mockResolvedValue({ id: fakeNoteId });
    mockCreateOneNoteTarget.mockResolvedValue({
      id: 'fake-note-target-id',
    });
    mockCreateOneTask.mockResolvedValue({ id: fakeTaskId });
    mockCreateOneTaskTarget.mockResolvedValue({
      id: 'fake-task-target-id',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create a note without dueAt and open it in the side panel', async () => {
    const { result } = renderHook(
      () =>
        useOpenCreateActivityDrawer({
          activityObjectNameSingular: CoreObjectNameSingular.Note,
        }),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await result.current({
        targetableObjects: [],
      });
    });

    expect(mockCreateOneNote).toHaveBeenCalledWith({
      position: 'last',
    });

    expect(mockCreateOneNoteTarget).toHaveBeenCalledWith({
      noteId: fakeNoteId,
    });

    expect(mockOpenRecordInSidePanel).toHaveBeenCalledWith({
      recordId: fakeNoteId,
      objectNameSingular: CoreObjectNameSingular.Note,
      isNewRecord: true,
    });

    expect(jotaiStore.get(viewableRecordIdState.atom)).toBe(fakeNoteId);
    expect(jotaiStore.get(viewableRecordNameSingularState.atom)).toBe(
      CoreObjectNameSingular.Note,
    );
    expect(jotaiStore.get(activityTargetableEntityArrayState.atom)).toEqual([]);
    expect(jotaiStore.get(isUpsertingActivityInDBState.atom)).toBe(false);
  });

  it.each([new Date(2026, 6, 14, 8, 30), new Date(2026, 6, 14, 17, 30)])(
    'should create a task at 9 AM on the current local day when now is %s',
    async (currentTime) => {
      jest.useFakeTimers();
      jest.setSystemTime(currentTime);

      const expectedDueAt = new Date(currentTime);
      expectedDueAt.setHours(9, 0, 0, 0);

      const targetableObjects = [
        {
          id: 'company-id',
          targetObjectNameSingular: CoreObjectNameSingular.Company,
        },
      ];

      const { result } = renderHook(
        () =>
          useOpenCreateActivityDrawer({
            activityObjectNameSingular: CoreObjectNameSingular.Task,
          }),
        { wrapper: Wrapper },
      );

      await act(async () => {
        await result.current({
          targetableObjects,
          customAssignee: { id: 'assignee-id' } as WorkspaceMember,
        });
      });

      expect(mockCreateOneTask).toHaveBeenCalledWith({
        assigneeId: 'assignee-id',
        dueAt: expectedDueAt.toISOString(),
        position: 'last',
      });

      expect(mockCreateOneTaskTarget).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: fakeTaskId,
        }),
      );
      expect(Object.values(mockCreateOneTaskTarget.mock.calls[0][0])).toContain(
        'company-id',
      );
      expect(jotaiStore.get(activityTargetableEntityArrayState.atom)).toEqual(
        targetableObjects,
      );
    },
  );

  it('should create a note target with the targetable object relation when targets are provided', async () => {
    const targetableObjects = [
      {
        id: 'company-id',
        targetObjectNameSingular: CoreObjectNameSingular.Company,
      },
    ];

    const { result } = renderHook(
      () =>
        useOpenCreateActivityDrawer({
          activityObjectNameSingular: CoreObjectNameSingular.Note,
        }),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await result.current({
        targetableObjects,
      });
    });

    expect(mockCreateOneNote).toHaveBeenCalledWith({
      position: 'last',
    });

    expect(mockCreateOneNoteTarget).toHaveBeenCalledWith(
      expect.objectContaining({
        noteId: fakeNoteId,
      }),
    );

    expect(jotaiStore.get(activityTargetableEntityArrayState.atom)).toEqual(
      targetableObjects,
    );
  });
});
