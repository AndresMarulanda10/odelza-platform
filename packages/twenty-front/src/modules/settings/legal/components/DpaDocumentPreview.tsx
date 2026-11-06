import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { type DpaDocument } from '@/settings/legal/types/Dpa';

const StyledDocument = styled.div`
  background: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  line-height: 1.5;
  max-height: 460px;
  overflow-y: auto;
  padding: ${odelzaThemeCssVariables.spacing[6]};
`;

const StyledTitle = styled.h1`
  font-size: ${odelzaThemeCssVariables.font.size.lg};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledLastUpdated = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  margin-bottom: ${odelzaThemeCssVariables.spacing[4]};
  margin-top: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledHeading = styled.h2`
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  margin-bottom: ${odelzaThemeCssVariables.spacing[1]};
  margin-top: ${odelzaThemeCssVariables.spacing[4]};
`;

const StyledParagraph = styled.p`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  margin: ${odelzaThemeCssVariables.spacing[2]} 0;
  text-align: justify;
`;

const StyledSignatureField = styled.div`
  margin: ${odelzaThemeCssVariables.spacing[2]} 0;
`;

const StyledSignatureLabel = styled.div`
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledSignatureValue = styled.div`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  white-space: pre-wrap;
`;

type DpaDocumentPreviewProps = {
  document: DpaDocument;
};

export const DpaDocumentPreview = ({ document }: DpaDocumentPreviewProps) => (
  // tabIndex makes the scrollable region focusable so keyboard-only users can
  // scroll the agreement with the arrow keys.
  <StyledDocument tabIndex={0} role="region" aria-label={document.title}>
    <StyledTitle>{document.title}</StyledTitle>
    <StyledLastUpdated>
      Last Updated: {document.lastUpdatedLabel}
    </StyledLastUpdated>
    {document.blocks.map((block, index) => {
      if (block.kind === 'heading') {
        return <StyledHeading key={index}>{block.text}</StyledHeading>;
      }

      if (block.kind === 'signatureField') {
        return (
          <StyledSignatureField key={index}>
            <StyledSignatureLabel>{block.label}</StyledSignatureLabel>
            <StyledSignatureValue>{block.value}</StyledSignatureValue>
          </StyledSignatureField>
        );
      }

      return <StyledParagraph key={index}>{block.text}</StyledParagraph>;
    })}
  </StyledDocument>
);
