import { styled } from '@linaria/react';
import { isValidElement, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Radio } from 'twenty-ui/input';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledCard = styled.div`
  background-color: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
`;

const StyledHeader = styled.button<{ hasBody: boolean; hasNote: boolean }>`
  align-items: center;
  background-color: transparent;
  border: none;
  border-bottom: ${({ hasBody }) =>
    hasBody
      ? `1px solid ${odelzaThemeCssVariables.border.color.light}`
      : 'none'};
  cursor: pointer;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  padding: ${({ hasNote }) =>
    hasNote
      ? `${odelzaThemeCssVariables.spacing[4]} ${odelzaThemeCssVariables.spacing[3]}`
      : odelzaThemeCssVariables.spacing[3]};
  position: relative;
  text-align: left;
  width: 100%;
`;

const StyledHeaderLeft = styled.div<{ hasNote: boolean }>`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[4]};
  min-width: 0;
  padding-right: ${({ hasNote }) =>
    hasNote ? odelzaThemeCssVariables.spacing[8] : '0'};
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledTitle = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  line-height: 1.4;
`;

const StyledTitleSuffix = styled.span<{ isEmphasized: boolean }>`
  color: ${({ isEmphasized }) =>
    isEmphasized
      ? odelzaThemeCssVariables.font.color.tertiary
      : odelzaThemeCssVariables.font.color.extraLight};
  font-size: ${({ isEmphasized }) =>
    isEmphasized
      ? odelzaThemeCssVariables.font.size.md
      : odelzaThemeCssVariables.font.size.sm};
  font-weight: ${({ isEmphasized }) =>
    isEmphasized
      ? odelzaThemeCssVariables.font.weight.medium
      : odelzaThemeCssVariables.font.weight.regular};
  line-height: 1.4;
`;

const StyledNote = styled.span`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  line-height: 1.4;
`;

const StyledHeaderRight = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  min-height: ${odelzaThemeCssVariables.spacing[6]};
`;

const StyledBadge = styled.span`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.grayScale.gray3};
  border-radius: ${odelzaThemeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  corner-shape: round;
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  height: ${odelzaThemeCssVariables.spacing[5]};
  padding: 0 ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledRadioContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${odelzaThemeCssVariables.spacing[6]};
  justify-content: center;
  position: absolute;
  right: ${odelzaThemeCssVariables.spacing[2]};
  top: ${odelzaThemeCssVariables.spacing[2]};
  width: ${odelzaThemeCssVariables.spacing[6]};
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${odelzaThemeCssVariables.spacing[4]}
    ${odelzaThemeCssVariables.spacing[3]};
`;

type OnboardingPlanCardProps = {
  title: string;
  titleSuffix?: string;
  note?: string;
  badge?: string;
  selected: boolean;
  onSelect: () => void;
  children?: ReactNode;
};

export const OnboardingPlanCard = ({
  title,
  titleSuffix,
  note,
  badge,
  selected,
  onSelect,
  children,
}: OnboardingPlanCardProps) => {
  const hasBody = isValidElement(children);
  const hasNote = isDefined(note);

  return (
    <StyledCard>
      <StyledHeader
        type="button"
        hasBody={hasBody}
        hasNote={hasNote}
        onClick={onSelect}
      >
        <StyledHeaderLeft hasNote={hasNote}>
          <StyledTitleRow>
            <StyledTitle>{title}</StyledTitle>
            {isDefined(titleSuffix) && (
              <StyledTitleSuffix isEmphasized={hasNote}>
                {titleSuffix}
              </StyledTitleSuffix>
            )}
          </StyledTitleRow>
          {hasNote && <StyledNote>{note}</StyledNote>}
        </StyledHeaderLeft>
        {hasNote ? (
          <StyledRadioContainer>
            <Radio checked={selected} />
          </StyledRadioContainer>
        ) : (
          <StyledHeaderRight>
            {isDefined(badge) && <StyledBadge>{badge}</StyledBadge>}
            <Radio checked={selected} />
          </StyledHeaderRight>
        )}
      </StyledHeader>
      {hasBody && <StyledBody>{children}</StyledBody>}
    </StyledCard>
  );
};
