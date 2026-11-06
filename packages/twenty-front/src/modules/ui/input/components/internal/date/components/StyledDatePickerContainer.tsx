import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const DATE_PICKER_CONTAINER_WIDTH = 280;

export const StyledDatePickerContainer = styled.div<{
  calendarDisabled?: boolean;
  hideCalendar?: boolean;
}>`
  width: ${DATE_PICKER_CONTAINER_WIDTH}px;

  & .react-datepicker {
    border-color: ${odelzaThemeCssVariables.border.color.light};
    background: transparent;
    font-family: 'Inter';
    font-size: ${odelzaThemeCssVariables.font.size.md};
    border: none;
    display: block;
    font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  }

  & .react-datepicker-popper {
    position: relative !important;
    inset: auto !important;
    transform: none !important;
    padding: 0 !important;
  }

  & .react-datepicker__triangle {
    display: none;
  }

  & .react-datepicker__triangle::after {
    display: none;
  }

  & .react-datepicker__triangle::before {
    display: none;
  }

  & .react-datepicker-wrapper {
    display: none;
  }

  // Header

  & .react-datepicker__header {
    background: transparent;
    border: none;
    padding: 0;
  }

  &
    .react-datepicker__input-time-container
    .react-datepicker-time__input-container
    .react-datepicker-time__input {
    outline: none;
  }

  & .react-datepicker__header__dropdown {
    display: flex;
    color: ${odelzaThemeCssVariables.font.color.primary};
    margin-left: ${odelzaThemeCssVariables.spacing[1]};
    margin-bottom: ${odelzaThemeCssVariables.spacing[10]};
  }

  & .react-datepicker__month-dropdown-container,
  & .react-datepicker__year-dropdown-container {
    text-align: left;
    border-radius: calc(
      ${odelzaThemeCssVariables.border.radius.md} -
        ${odelzaThemeCssVariables.spacing[1]}
    );
    margin-left: ${odelzaThemeCssVariables.spacing[1]};
    margin-right: 0;
    padding: ${odelzaThemeCssVariables.spacing[2]};
    padding-right: ${odelzaThemeCssVariables.spacing[4]};
    background-color: ${odelzaThemeCssVariables.background.tertiary};
  }

  & .react-datepicker__month-read-view--down-arrow,
  & .react-datepicker__year-read-view--down-arrow {
    height: 5px;
    width: 5px;
    border-width: 1px 1px 0 0;
    border-color: ${odelzaThemeCssVariables.border.color.light};
    top: 3px;
    right: -6px;
  }

  & .react-datepicker__year-read-view,
  & .react-datepicker__month-read-view {
    padding-right: ${odelzaThemeCssVariables.spacing[2]};
  }

  & .react-datepicker__month-dropdown-container {
    width: 80px;
  }

  & .react-datepicker__year-dropdown-container {
    width: 50px;
  }

  & .react-datepicker__month-dropdown,
  & .react-datepicker__year-dropdown {
    overflow-y: scroll;
    top: ${odelzaThemeCssVariables.spacing[2]};
  }
  & .react-datepicker__month-dropdown {
    left: ${odelzaThemeCssVariables.spacing[2]};
    height: 260px;
  }

  & .react-datepicker__year-dropdown {
    left: calc(${odelzaThemeCssVariables.spacing[9]} + 80px);
    width: 100px;
    height: 260px;
  }

  & .react-datepicker__navigation--years {
    display: none;
  }

  & .react-datepicker__month-option--selected,
  & .react-datepicker__year-option--selected {
    display: none;
  }

  & .react-datepicker__year-option,
  & .react-datepicker__month-option {
    text-align: left;
    padding: ${odelzaThemeCssVariables.spacing[2]}
      calc(${odelzaThemeCssVariables.spacing[2]} - 2px);
    width: calc(100% - ${odelzaThemeCssVariables.spacing[4]});
    border-radius: ${odelzaThemeCssVariables.border.radius.xs};
    color: ${odelzaThemeCssVariables.font.color.secondary};
    cursor: pointer;
    margin: 2px;

    &:hover {
      background: ${odelzaThemeCssVariables.background.transparent.light};
    }
  }

  & .react-datepicker__year-option {
    &:first-of-type,
    &:last-of-type {
      display: none;
    }
  }

  & .react-datepicker__current-month {
    display: none;
  }

  & .react-datepicker__day-name {
    color: ${odelzaThemeCssVariables.font.color.secondary};
    width: 34px;
    height: 40px;
    line-height: 40px;
    // Uniform 2px margin keeps the header row aligned with the day grid below;
    // react-datepicker's default (0.166rem) leaves the grid tighter on the right.
    margin: 2px;
  }

  & .react-datepicker__month-container {
    float: none;
  }

  // Days

  & .react-datepicker__month {
    margin: 0;

    pointer-events: ${({ calendarDisabled }) =>
      calendarDisabled ? 'none' : 'auto'};
    opacity: ${({ calendarDisabled }) => (calendarDisabled ? '0.5' : '1')};

    display: ${({ hideCalendar }) =>
      hideCalendar === true ? 'none' : 'visible'};
  }

  & .react-datepicker__day-names {
    display: ${({ hideCalendar }) =>
      hideCalendar === true ? 'none' : 'visible'};
  }

  & .react-datepicker__day {
    width: 34px;
    height: 34px;
    line-height: 34px;
    // Matches the day-name margin so each column lines up symmetrically.
    margin: 2px;
  }

  & .react-datepicker__navigation--previous,
  & .react-datepicker__navigation--next {
    height: 34px;
    border-radius: calc(
      ${odelzaThemeCssVariables.border.radius.md} -
        ${odelzaThemeCssVariables.spacing[1]}
    );
    padding-top: 6px;
    &:hover {
      background: ${odelzaThemeCssVariables.background.transparent.light};
    }
  }
  & .react-datepicker__navigation--previous {
    right: 38px;
    top: 6px;
    left: auto;

    & > span {
      margin-left: -6px;
    }
  }

  & .react-datepicker__navigation--next {
    right: 6px;
    top: 6px;

    & > span {
      margin-left: 6px;
    }
  }

  & .react-datepicker__navigation-icon::before {
    height: 7px;
    width: 7px;
    border-width: 1px 1px 0 0;
    border-color: ${odelzaThemeCssVariables.font.color.tertiary};
  }

  & .react-datepicker__day--keyboard-selected {
    background-color: inherit;
  }

  & .react-datepicker__day,
  .react-datepicker__time-name {
    color: ${odelzaThemeCssVariables.font.color.primary};
  }

  & .react-datepicker__day--selected,
  & .react-datepicker__day--in-range,
  & .react-datepicker__day--range-start,
  & .react-datepicker__day--range-end {
    background-color: ${odelzaThemeCssVariables.color.primary};
    color: ${odelzaThemeCssVariables.background.primary};

    &.react-datepicker__day:hover {
      color: ${odelzaThemeCssVariables.background.primary};
    }
  }

  & .react-datepicker__day--outside-month {
    color: ${odelzaThemeCssVariables.font.color.tertiary};
  }

  & .react-datepicker__day:hover {
    color: ${odelzaThemeCssVariables.font.color.tertiary};
  }

  & .clearable {
    border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  }
`;
