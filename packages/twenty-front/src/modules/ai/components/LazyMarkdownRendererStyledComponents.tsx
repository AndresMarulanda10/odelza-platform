import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const StyledMarkdownContainer = styled.div`
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  line-height: 150%;
  margin: ${odelzaThemeCssVariables.spacing['1.5']} 0;
  overflow-x: auto;
  position: relative;
  scroll-margin-bottom: ${odelzaThemeCssVariables.spacing[10]};
  scroll-margin-top: ${odelzaThemeCssVariables.spacing[10]};

  &:empty {
    display: none;
  }

  .markdown-link {
    -webkit-text-decoration: none;
    color: ${odelzaThemeCssVariables.accent.accent11};
    text-decoration: none;
  }

  .markdown-link:visited {
    color: ${odelzaThemeCssVariables.accent.accent11};
  }

  .markdown-link:hover {
    text-decoration: underline !important;
  }

  strong,
  b {
    font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  }

  h1,
  h2,
  h3 {
    font-weight: ${odelzaThemeCssVariables.font.weight.semiBold} !important;
  }

  h1 {
    font-size: 1.6em;
    line-height: 1.25;
    margin-bottom: 12px;
    margin-top: 24px;
  }

  h2 {
    font-size: 1.3em;
    line-height: 1.25;
    margin-bottom: 10px;
    margin-top: 20px;
  }

  h3 {
    font-size: 1.15em;
    line-height: 1.25;
    margin-bottom: 8px;
    margin-top: 18px;
  }

  h4 {
    font-size: 1.05em;
    line-height: 1.25;
    margin-bottom: 8px;
    margin-top: 16px;
  }

  h5 {
    font-size: 0.95em;
    line-height: 1.25;
    margin-bottom: 6px;
    margin-top: 14px;
  }

  h6 {
    font-size: 0.85em;
    line-height: 1.25;
    margin-bottom: 6px;
    margin-top: 12px;
  }

  hr {
    background-color: ${odelzaThemeCssVariables.border.color.light} !important;
    border: none;
    height: 1px;
    margin: ${odelzaThemeCssVariables.spacing[4]} 0;
  }

  ol:first-of-type:not(.nested),
  ul:first-of-type:not(.nested) {
    margin-top: ${odelzaThemeCssVariables.spacing[1]} !important;
  }

  ol:last-of-type:not(.nested),
  ul:last-of-type:not(.nested) {
    margin-bottom: ${odelzaThemeCssVariables.spacing[1]} !important;
  }

  li {
    line-height: 150%;
    margin-bottom: ${odelzaThemeCssVariables.spacing['0.5']} !important;
    margin-top: ${odelzaThemeCssVariables.spacing['0.5']} !important;
    padding-bottom: ${odelzaThemeCssVariables.spacing['0.5']} !important;
    padding-top: ${odelzaThemeCssVariables.spacing['0.5']} !important;
  }

  :not(pre) > code {
    background-color: ${odelzaThemeCssVariables.background.tertiary};
    border-radius: ${odelzaThemeCssVariables.border.radius.sm};
    color: ${odelzaThemeCssVariables.color.red10};
    font-family: ${odelzaThemeCssVariables.code.font.family}, monospace;
    font-size: 1em;
    padding: ${odelzaThemeCssVariables.spacing[0]}
      ${odelzaThemeCssVariables.spacing[1]};
    transition: all
      calc(${odelzaThemeCssVariables.animation.duration.fast} * 1s) ease;
  }

  :not(pre) > code[style*='cursor: pointer'] {
    background-color: ${odelzaThemeCssVariables.background.secondary};
    border: 1px solid ${odelzaThemeCssVariables.accent.accent10};
    color: ${odelzaThemeCssVariables.accent.accent10};
  }

  :not(pre) > code[style*='cursor: pointer']:hover {
    background-color: ${odelzaThemeCssVariables.background.transparent.accent};
  }

  .markdown-code-outer-container {
    border-radius: ${odelzaThemeCssVariables.border.radius.md} !important;
    overflow: hidden;
  }

  .markdown-block-code {
    background-color: ${odelzaThemeCssVariables.background.secondary};
    border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
    border-radius: ${odelzaThemeCssVariables.border.radius.md} !important;
    overflow-x: auto;
  }

  .markdown-block-code * {
    animation: none !important;
  }

  img {
    height: auto;
    max-width: 100%;
  }
`;

export const StyledParagraph = styled.div`
  line-height: inherit;
  margin-block: ${odelzaThemeCssVariables.spacing[2]};

  &:first-child {
    margin-block-start: 0;
  }

  &:last-child {
    margin-block-end: 0;
  }
`;

export const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  width: 100%;
`;

export const StyledTableScrollContainer = styled.div`
  overflow-x: auto;

  table {
    border-collapse: collapse;
    margin-block: ${odelzaThemeCssVariables.spacing[2]};
  }

  th,
  td {
    border: 1px solid ${odelzaThemeCssVariables.border.color.light};
    padding: ${odelzaThemeCssVariables.spacing[2]};
  }

  th {
    background-color: ${odelzaThemeCssVariables.background.secondary};
    font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  }
`;
