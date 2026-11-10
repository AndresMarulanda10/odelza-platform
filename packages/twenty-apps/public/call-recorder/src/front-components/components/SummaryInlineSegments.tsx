import styled from '@emotion/styled';
import { Fragment } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { type SummaryInlineSegment } from 'src/front-components/types/summary-inline-segment.type';

const StyledBold = styled.strong`
  color: ${() => odelzaThemeCssVariables.font.color.primary};
  font-weight: ${() => odelzaThemeCssVariables.font.weight.medium};
`;

type SummaryInlineSegmentsProps = {
  segments: SummaryInlineSegment[];
};

export const SummaryInlineSegments = ({
  segments,
}: SummaryInlineSegmentsProps) => (
  <>
    {segments.map((segment, index) =>
      segment.isBold ? (
        <StyledBold key={index}>{segment.text}</StyledBold>
      ) : (
        <Fragment key={index}>{segment.text}</Fragment>
      ),
    )}
  </>
);
