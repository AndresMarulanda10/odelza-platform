import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { Label } from 'twenty-ui/typography';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.strong};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  justify-content: center;
  padding-block: ${odelzaThemeCssVariables.spacing[0.5]};
  padding-inline: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledNumber = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
`;

type WorkflowDiagramEdgeLabelProps = {
  label: string;
  elseIfIndex?: number;
};

export const WorkflowDiagramEdgeLabel = ({
  label,
  elseIfIndex,
}: WorkflowDiagramEdgeLabelProps) => {
  return (
    <StyledContainer>
      {isDefined(elseIfIndex) && <StyledNumber>{elseIfIndex}</StyledNumber>}
      <Label>{label}</Label>
    </StyledContainer>
  );
};
