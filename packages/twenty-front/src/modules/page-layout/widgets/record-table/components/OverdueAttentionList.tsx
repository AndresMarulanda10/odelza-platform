import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useOpenOverdueRecordInSidePanel } from '@/page-layout/widgets/record-table/hooks/useOpenOverdueRecordInSidePanel';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOverdueAttentionRecords } from '@/page-layout/widgets/record-table/hooks/useOverdueAttentionRecords';
import { getOverdueCalendarDays } from '@/page-layout/widgets/record-table/utils/getOverdueCalendarDays';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';
import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContent = styled.div`
  color: ${themeCssVariables.font.color.primary};
  container: overdue-attention / inline-size;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;
const StyledHeader = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  flex: 0 0 auto;
  padding: 4px 12px 8px;
`;
const StyledList = styled.ul`
  align-content: start;
  column-gap: 20px;
  display: grid;
  flex: 1 1 auto;
  grid-auto-rows: max-content;
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  margin: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 0 12px;
  @container overdue-attention (min-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const StyledRow = styled.li`
  --overdue-accent: ${themeCssVariables.color.orange};
  --overdue-background: ${themeCssVariables.tag.background.orange};
  --overdue-text: ${themeCssVariables.tag.text.orange};
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: 12px;
  min-width: 0;
  padding: 10px 0;
  position: relative;
  &[data-severity='urgent'] {
    --overdue-accent: ${themeCssVariables.color.red};
    --overdue-background: ${themeCssVariables.tag.background.red};
    --overdue-text: ${themeCssVariables.tag.text.red};
  }
`;
const StyledDetails = styled.div`
  border-left: 3px solid var(--overdue-accent);
  flex: 1 1 auto;
  min-width: 0;
  padding-left: 10px;
  pointer-events: none;
`;
const StyledActivation = styled.button`
  background: none;
  border: 0;
  cursor: pointer;
  height: 100%;
  inset: 0;
  position: absolute;
  width: 100%;
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }
`;
const StyledTitle = styled.span`
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: block;
  font: inherit;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;
const StyledMetadata = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  gap: 4px 8px;
  margin-top: 5px;
  min-width: 0;
  overflow-wrap: anywhere;
  > span {
    max-width: 100%;
    min-width: 0;
  }
`;
const StyledBadge = styled.span`
  background: var(--overdue-background);
  border-radius: 6px;
  color: var(--overdue-text);
  flex: 0 0 auto;
  font-size: 11px;
  padding: 4px 6px;
  pointer-events: none;
  text-align: center;
`;
const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 6px 12px;
  justify-content: space-between;
  padding: 8px 12px;
  button {
    background: none;
    border: 0;
    color: ${themeCssVariables.font.color.primary};
    cursor: pointer;
    font: inherit;
    padding: 2px;
  }
  button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  button:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;

export const OverdueAttentionList = ({
  assigneeFields,
  assigneeObjectName,
  isAssigneeImageHidden = false,
}: {
  assigneeFields?: RecordGqlOperationGqlRecordFields;
  assigneeObjectName?: string;
  isAssigneeImageHidden?: boolean;
}) => {
  const data = useOverdueAttentionRecords(assigneeFields);
  const { userTimezone } = useUserTimezone();
  const { openOverdueRecordInSidePanel } = useOpenOverdueRecordInSidePanel();
  const [expansion, setExpansion] = useState<string | null>(null);
  const expanded = expansion === data.identity;
  const listRef = useRef<HTMLUListElement>(null);
  const records = expanded ? data.records : data.records.slice(0, 5);
  const toggleExpanded = () => {
    setExpansion(expanded ? null : data.identity);
    if (listRef.current) listRef.current.scrollTop = 0;
    if (!expanded && data.hasNextPage) void data.loadMore();
  };

  return (
    <StyledContent>
      <StyledHeader role="status" aria-live="polite">
        {data.totalCount === null
          ? 'Overdue tasks'
          : `${data.totalCount} overdue ${data.totalCount === 1 ? 'task' : 'tasks'}`}
      </StyledHeader>
      <StyledList
        ref={listRef}
        aria-label="Overdue tasks"
        tabIndex={0}
        aria-busy={data.loading}
      >
        {records.map((record) => {
          const title =
            typeof record.title === 'string' && record.title
              ? record.title
              : 'Untitled task';
          const days = getOverdueCalendarDays(record.dueAt, userTimezone);
          const assignee = record.assignee as ObjectRecord | null | undefined;
          return (
            <StyledRow
              key={record.id}
              data-severity={
                days !== null && days >= 7 ? 'urgent' : 'attention'
              }
            >
              <StyledActivation
                type="button"
                aria-label={title}
                title={title}
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  openOverdueRecordInSidePanel({ recordId: record.id });
                }}
              />
              <StyledDetails>
                <StyledTitle title={title}>{title}</StyledTitle>
                <StyledMetadata>
                  <span>
                    {!assigneeObjectName ? (
                      'Assignee unavailable'
                    ) : assignee ? (
                      <RecordChip
                        objectNameSingular={assigneeObjectName}
                        record={assignee}
                        forceDisableClick
                        isIconHidden={isAssigneeImageHidden}
                      />
                    ) : (
                      'Unassigned'
                    )}
                  </span>
                  <span>
                    {days !== null ? (
                      <DateTimeDisplay value={record.dueAt as string} />
                    ) : (
                      'Due date unavailable'
                    )}
                  </span>
                </StyledMetadata>
              </StyledDetails>
              {days !== null && (
                <StyledBadge
                  aria-label={`${days} ${days === 1 ? 'day' : 'days'} overdue`}
                >
                  {days} {days === 1 ? 'day' : 'days'}
                  <br />
                  overdue
                </StyledBadge>
              )}
            </StyledRow>
          );
        })}
        {data.loading && <li role="status">Loading overdue tasks…</li>}
        {data.error && <li role="alert">Unable to load overdue tasks.</li>}
        {!data.loading && !data.error && data.totalCount === 0 && (
          <li role="status">No overdue tasks</li>
        )}
      </StyledList>
      <StyledFooter>
        <span>
          {records.length}
          {data.totalCount !== null ? ` of ${data.totalCount}` : ''}
        </span>
        {data.error && (
          <button
            onClick={() =>
              data.totalCount === null ? data.retry() : void data.loadMore()
            }
            disabled={data.loading}
          >
            Retry
          </button>
        )}
        {(expanded || (data.totalCount ?? 0) > 5) && (
          <button aria-expanded={expanded} onClick={toggleExpanded}>
            {expanded ? 'Show less' : 'View all'}
          </button>
        )}
        {expanded && data.hasNextPage && !data.error && (
          <button onClick={() => void data.loadMore()} disabled={data.loading}>
            Load more
          </button>
        )}
      </StyledFooter>
    </StyledContent>
  );
};
