import { render, screen } from '@testing-library/react';
import { RecordTableWidgetRenderer } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRenderer';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { OverdueAttentionWidget } from '@/page-layout/widgets/record-table/components/OverdueAttentionWidget';
import { OverdueAttentionViewGate } from '@/page-layout/widgets/record-table/components/OverdueAttentionViewGate';
import { createDefaultRecordTableWidget } from '@/page-layout/utils/createDefaultRecordTableWidget';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { type ObjectPermissions } from 'twenty-shared/types';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const mockTask = getMockObjectMetadataItemOrThrow('task');
const mockMember = getMockObjectMetadataItemOrThrow('workspaceMember');
let mockObjects = [mockTask, mockMember];
let mockLoaded: unknown = {
  viewId: 'view',
  objectMetadataItemUpdatedAt: mockTask.updatedAt,
};
const mockPermission: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};
let mockPermissions = {
  [mockTask.id]: mockPermission,
  [mockMember.id]: mockPermission,
};
const mockProvider = jest.fn();
const mockList = jest.fn();
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: mockObjects }),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({ objectMetadataItem: mockTask }),
}));
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({
    objectPermissionsByObjectMetadataId: mockPermissions,
  }),
}));
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({ objectMetadataItem: mockObjects[0] }),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: () => mockLoaded }),
);
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidgetProvider',
  () => ({
    RecordTableWidgetProvider: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
    }) => {
      mockProvider(props);
      return <div data-testid="native-provider">{children}</div>;
    },
  }),
);
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidget',
  () => ({ RecordTableWidget: () => <div>Native table</div> }),
);
jest.mock(
  '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftInitEffect',
  () => ({ RecordTableWidgetViewDraftInitEffect: () => null }),
);
jest.mock(
  '@/page-layout/widgets/record-table/components/OverdueAttentionList',
  () => ({
    OverdueAttentionList: (props: unknown) => {
      mockList(props);
      return <div>Native attention</div>;
    },
  }),
);

const widget = (presentationMode?: string | null) => ({
  ...createDefaultRecordTableWidget({
    id: 'widget',
    pageLayoutTabId: 'tab',
    title: 'Overdue tasks',
    gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
    objectMetadataId: mockTask.id,
  }),
  configuration: {
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    viewId: 'view',
    recordLimit: 5,
    presentationMode,
  },
});

describe('actual native renderer dispatch and attention readiness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjects = [mockTask, mockMember];
    mockPermissions = {
      [mockTask.id]: mockPermission,
      [mockMember.id]: mockPermission,
    };
    mockLoaded = {
      viewId: 'view',
      objectMetadataItemUpdatedAt: mockTask.updatedAt,
    };
  });
  it.each([undefined, null, 'TABLE'])(
    'keeps native TABLE behavior for %s',
    (mode) => {
      render(<RecordTableWidgetRenderer widget={widget(mode)} />);
      expect(screen.getByText('Native table')).toBeInTheDocument();
      expect(mockList).not.toHaveBeenCalled();
      expect(mockProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          viewId: 'view',
          widgetId: 'widget',
          recordLimit: 5,
        }),
      );
    },
  );
  it('dispatches only the presentation child under the same provider', () => {
    render(<RecordTableWidgetRenderer widget={widget('OVERDUE_ATTENTION')} />);
    expect(screen.getByTestId('native-provider')).toHaveTextContent(
      'Native attention',
    );
    expect(screen.queryByText('Native table')).not.toBeInTheDocument();
  });
  it('waits for asynchronous metadata and explicit object permission without querying', () => {
    mockObjects = [];
    const { rerender } = render(
      <OverdueAttentionWidget
        objectMetadataId={mockTask.id}
        viewId="view"
        widgetId="widget"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(mockList).not.toHaveBeenCalled();
    mockObjects = [mockTask, mockMember];
    mockPermissions = {};
    rerender(
      <OverdueAttentionWidget
        objectMetadataId={mockTask.id}
        viewId="view"
        widgetId="widget"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(mockList).not.toHaveBeenCalled();
    mockPermissions = {
      [mockTask.id]: { ...mockPermission, canReadObjectRecords: false },
    };
    rerender(
      <OverdueAttentionWidget
        objectMetadataId={mockTask.id}
        viewId="view"
        widgetId="widget"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('permissions');
    expect(mockProvider).not.toHaveBeenCalled();
  });
  it('rejects unreadable required fields and nonstandard sources at render, not just creation', () => {
    mockObjects = [
      {
        ...mockTask,
        readableFields: mockTask.readableFields.filter(
          (field) => field.name !== 'dueAt',
        ),
      },
      mockMember,
    ];
    const { rerender } = render(
      <OverdueAttentionWidget
        objectMetadataId={mockTask.id}
        viewId="view"
        widgetId="widget"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'source is unavailable',
    );
    mockObjects = [
      { ...mockTask, universalIdentifier: 'not-standard' },
      mockMember,
    ];
    rerender(
      <OverdueAttentionWidget
        objectMetadataId={mockTask.id}
        viewId="view"
        widgetId="widget"
      />,
    );
    expect(mockList).not.toHaveBeenCalled();
  });
  it('does not mount queries until native view state is loaded for this source', () => {
    mockLoaded = {
      viewId: 'old-view',
      objectMetadataItemUpdatedAt: mockTask.updatedAt,
    };
    render(
      <RecordTableWidgetRendererContent
        objectMetadataId={mockTask.id}
        widgetId="widget"
        viewId="view"
        presentationMode="OVERDUE_ATTENTION"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(mockList).not.toHaveBeenCalled();
  });
  it('waits for asynchronously missing related metadata before the native depth-one selector', () => {
    mockObjects = [mockTask];
    render(<OverdueAttentionViewGate viewId="view" />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading task details',
    );
    expect(mockList).not.toHaveBeenCalled();
  });
  it('prunes denied related identity/avatar fields, including cached values', () => {
    mockPermissions[mockMember.id] = {
      ...mockPermission,
      restrictedFields: {
        [mockMember.labelIdentifierFieldMetadataId]: {
          canRead: false,
          canUpdate: false,
        },
      },
    };
    const { rerender } = render(<OverdueAttentionViewGate viewId="view" />);
    expect(mockList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        assigneeFields: undefined,
        assigneeObjectName: undefined,
      }),
    );
    mockPermissions[mockMember.id] = {
      ...mockPermission,
      restrictedFields: {
        [mockMember.imageIdentifierFieldMetadataId!]: {
          canRead: false,
          canUpdate: false,
        },
      },
    };
    rerender(<OverdueAttentionViewGate viewId="view" />);
    expect(mockList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isAssigneeImageHidden: true,
        assigneeFields: { id: true, name: true },
      }),
    );
    mockPermissions[mockMember.id] = {
      ...mockPermission,
      canReadObjectRecords: false,
    };
    rerender(<OverdueAttentionViewGate viewId="view" />);
    expect(mockList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        assigneeFields: undefined,
        assigneeObjectName: undefined,
      }),
    );
  });
});
