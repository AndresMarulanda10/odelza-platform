import styled from '@emotion/styled';
import { useMemo } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { SummaryInlineSegments } from 'src/front-components/components/SummaryInlineSegments';
import { parseSummaryMarkdownBlocks } from 'src/front-components/utils/parse-summary-markdown-blocks.util';

const TOP_LEVEL_HEADING_MAX = 2;

const StyledSummary = styled.div`
  color: ${() => odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-family: ${() => odelzaThemeCssVariables.font.family};
  font-size: ${() => odelzaThemeCssVariables.font.size.sm};
  gap: ${() => odelzaThemeCssVariables.spacing[2]};
  line-height: 1.5;
`;

const StyledHeading = styled.h3<{ $isTopLevel: boolean }>`
  color: ${() => odelzaThemeCssVariables.font.color.primary};
  font-size: ${({ $isTopLevel }) =>
    $isTopLevel
      ? odelzaThemeCssVariables.font.size.md
      : odelzaThemeCssVariables.font.size.sm};
  font-weight: ${() => odelzaThemeCssVariables.font.weight.medium};
  margin: 0;
  margin-top: ${() => odelzaThemeCssVariables.spacing[1]};
`;

const StyledParagraph = styled.p`
  margin: 0;
`;

const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${() => odelzaThemeCssVariables.spacing[1]};
  margin: 0;
  padding-left: ${() => odelzaThemeCssVariables.spacing[3]};
`;

type SummaryMarkdownProps = {
  markdown: string;
};

export const SummaryMarkdown = ({ markdown }: SummaryMarkdownProps) => {
  const blocks = useMemo(
    () => parseSummaryMarkdownBlocks(markdown),
    [markdown],
  );

  return (
    <StyledSummary>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <StyledHeading
              key={index}
              $isTopLevel={block.level <= TOP_LEVEL_HEADING_MAX}
            >
              <SummaryInlineSegments segments={block.segments} />
            </StyledHeading>
          );
        }

        if (block.type === 'list') {
          return (
            <StyledList key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <SummaryInlineSegments segments={item} />
                </li>
              ))}
            </StyledList>
          );
        }

        return (
          <StyledParagraph key={index}>
            <SummaryInlineSegments segments={block.segments} />
          </StyledParagraph>
        );
      })}
    </StyledSummary>
  );
};
