import styled from '@emotion/styled';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledStateContainer = styled.div`
  box-sizing: border-box;
  font-family: ${() => odelzaThemeCssVariables.font.family};
  height: 100%;
  padding: ${() => odelzaThemeCssVariables.spacing[4]};
`;

const StyledErrorBox = styled.div`
  background: ${() => odelzaThemeCssVariables.background.transparent.danger};
  border: 1px solid ${() => odelzaThemeCssVariables.border.color.danger};
  border-radius: ${() => odelzaThemeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${() => odelzaThemeCssVariables.spacing[1]};
  padding: ${() => odelzaThemeCssVariables.spacing[3]};
`;

const StyledErrorTitle = styled.span`
  color: ${() => odelzaThemeCssVariables.font.color.danger};
  font-size: ${() => odelzaThemeCssVariables.font.size.sm};
  font-weight: ${() => odelzaThemeCssVariables.font.weight.medium};
`;

const StyledErrorDescription = styled.span`
  color: ${() => odelzaThemeCssVariables.font.color.secondary};
  font-size: ${() => odelzaThemeCssVariables.font.size.sm};
`;

type TranscriptErrorBoxProps = {
  title: string;
  description: string;
};

export const TranscriptErrorBox = ({
  title,
  description,
}: TranscriptErrorBoxProps) => (
  <StyledStateContainer>
    <StyledErrorBox>
      <StyledErrorTitle>{title}</StyledErrorTitle>
      <StyledErrorDescription>{description}</StyledErrorDescription>
    </StyledErrorBox>
  </StyledStateContainer>
);
