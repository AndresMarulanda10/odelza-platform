import { msg } from '@lingui/core/macro';
import { IconLayoutKanban, IconTable, IconTimelineEvent } from 'twenty-ui/icon';

import {
  getViewTypeLabel,
  ViewType,
  viewTypeIconMapping,
} from '@/views/types/ViewType';

describe('saved timeline view identity', () => {
  it('provides the timeline label and icon without a table fallback', () => {
    expect(getViewTypeLabel(ViewType.TIMELINE)).toEqual(msg`Timeline`);
    expect(viewTypeIconMapping(ViewType.TIMELINE)).toBe(IconTimelineEvent);
  });

  it('preserves existing table and Kanban identities', () => {
    expect(getViewTypeLabel(ViewType.TABLE)).toEqual(msg`Table`);
    expect(getViewTypeLabel(ViewType.KANBAN)).toEqual(msg`Kanban`);
    expect(viewTypeIconMapping(ViewType.TABLE)).toBe(IconTable);
    expect(viewTypeIconMapping(ViewType.KANBAN)).toBe(IconLayoutKanban);
  });
});
