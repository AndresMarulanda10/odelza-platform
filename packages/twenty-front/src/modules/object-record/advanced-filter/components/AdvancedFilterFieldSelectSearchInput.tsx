import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: 0;
  border-top: none;
  border-top-left-radius: ${odelzaThemeCssVariables.border.radius.md};
  border-top-right-radius: ${odelzaThemeCssVariables.border.radius.md};
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: inherit;
  margin: 0;
  max-width: 100%;
  min-height: 19px;

  outline: none;
  overflow: hidden;
  padding: ${odelzaThemeCssVariables.spacing[2]};
  text-decoration: none;

  &::placeholder {
    color: ${odelzaThemeCssVariables.font.color.light};
  }
`;

export const AdvancedFilterFieldSelectSearchInput = () => {
  const [objectFilterDropdownSearchInput, setObjectFilterDropdownSearchInput] =
    useAtomComponentState(objectFilterDropdownSearchInputComponentState);

  return (
    <StyledInput
      value={objectFilterDropdownSearchInput}
      autoFocus
      placeholder={t`Search fields`}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        setObjectFilterDropdownSearchInput(event.target.value)
      }
    />
  );
};
