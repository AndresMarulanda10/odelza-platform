/* @license Enterprise */

import { styled } from '@linaria/react';
import { IconVariablePlus } from 'twenty-ui/icon';
import { useContext } from 'react';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

const StyledRecordLevelPermissionPickerContainer = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  align-items: center;
  background-color: ${({ multiline }) =>
    multiline
      ? 'transparent'
      : odelzaThemeCssVariables.background.transparent.lighter};
  border: ${({ multiline }) =>
    multiline
      ? 'none'
      : `1px solid ${odelzaThemeCssVariables.border.color.medium}`};

  border-bottom-right-radius: ${({ multiline }) =>
    multiline ? '0' : odelzaThemeCssVariables.border.radius.sm};
  border-radius: ${({ multiline }) =>
    multiline ? odelzaThemeCssVariables.border.radius.sm : '0'};
  border-top-right-radius: ${({ multiline }) =>
    multiline ? '0' : odelzaThemeCssVariables.border.radius.sm};
  color: ${({ multiline }) =>
    multiline
      ? odelzaThemeCssVariables.font.color.primary
      : odelzaThemeCssVariables.font.color.tertiary};
  cursor: ${({ multiline }) => (multiline ? 'default' : 'pointer')};
  display: flex;
  justify-content: center;
  padding: ${({ multiline }) =>
    multiline
      ? `${odelzaThemeCssVariables.spacing['0.5']} ${odelzaThemeCssVariables.spacing[0]}`
      : odelzaThemeCssVariables.spacing[2]};
  position: ${({ multiline }) => (multiline ? 'absolute' : 'relative')};
  right: ${({ multiline }) =>
    multiline ? odelzaThemeCssVariables.spacing[0] : 'auto'};
  top: ${({ multiline }) =>
    multiline ? odelzaThemeCssVariables.spacing[0] : 'auto'};

  &:hover {
    background-color: ${({ readonly }) =>
      readonly
        ? 'transparent'
        : odelzaThemeCssVariables.background.transparent.light};
  }
`;

export const createRecordLevelPermissionVariablePicker = (
  recordFilterId: string,
  onMeSelect: (
    workspaceMemberFieldMetadataId: string,
    workspaceMemberSubFieldName?: string | null,
  ) => void,
): VariablePickerComponent => {
  const RecordLevelPermissionVariablePicker: VariablePickerComponent = ({
    instanceId,
    disabled,
    multiline,
  }) => {
    const { theme } = useContext(ThemeContext);

    return (
      <Dropdown
        dropdownId={`record-level-permission-me-picker-${instanceId}-${recordFilterId}`}
        clickableComponent={
          <StyledRecordLevelPermissionPickerContainer
            multiline={multiline}
            readonly={disabled}
          >
            <IconVariablePlus size={theme.icon.size.sm} />
          </StyledRecordLevelPermissionPickerContainer>
        }
        dropdownComponents={
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect
            onSelect={onMeSelect}
            recordFilterId={recordFilterId}
          />
        }
        dropdownPlacement="bottom-end"
      />
    );
  };

  return RecordLevelPermissionVariablePicker;
};
