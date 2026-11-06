import React from 'react';
import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledThreadMessageBodyPreview = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type EmailThreadMessageBodyPreviewProps = {
  body: string;
};

export const EmailThreadMessageBodyPreview = ({
  body,
}: EmailThreadMessageBodyPreviewProps) => {
  return (
    <StyledThreadMessageBodyPreview>{body}</StyledThreadMessageBodyPreview>
  );
};
