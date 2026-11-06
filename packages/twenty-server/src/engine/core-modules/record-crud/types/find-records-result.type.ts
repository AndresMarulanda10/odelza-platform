import { type CommonPageInfo } from 'src/engine/api/common/types/common-page-info.type';

export type FindRecordsResult = {
  records: unknown[];
  count: number;
  pageInfo: CommonPageInfo;
};
