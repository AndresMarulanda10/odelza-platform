import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type RecordCalendarMonthHeaderDayProps = {
  label: string;
};

const StyledLabel = styled.div`
  color: ${odelzaThemeCssVariables.font.color.light};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  height: 24px;
  justify-content: flex-end;
  padding: ${odelzaThemeCssVariables.spacing[0]}
    ${odelzaThemeCssVariables.spacing[1]};
  width: calc(100% / 7);
`;

export const RecordCalendarMonthHeaderDay = ({
  label,
}: RecordCalendarMonthHeaderDayProps) => {
  return <StyledLabel>{label}</StyledLabel>;
};
