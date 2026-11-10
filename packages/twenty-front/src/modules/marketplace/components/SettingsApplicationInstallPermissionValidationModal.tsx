import { AppConnectionHeader } from '@/applications/components/AppConnectionHeader';
import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import {
  buildPermissionSummaryFromRoleManifest,
  type PermissionSummaryItem,
} from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type RoleManifest } from 'twenty-shared/application';
import { IconChevronLeft } from 'twenty-ui/icon';
import { LightButton } from 'twenty-ui/input';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { StyledAppModal } from '~/pages/settings/applications/components/SettingsAppModalLayout';

type SettingsApplicationInstallPermissionValidationModalProps = {
  modalInstanceId: string;
  appDisplayName: string;
  appLogoUrl?: string;
  defaultRole?: RoleManifest;
  onAuthorize: () => void;
  isInstalling?: boolean;
};

const StyledFullscreenContainer = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: relative;
  width: 100%;
`;

const StyledLightButton = styled(LightButton)`
  left: ${odelzaThemeCssVariables.spacing[4]};
  position: absolute;
  top: ${odelzaThemeCssVariables.spacing[4]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  width: 100%;
`;

const StyledAppConnectionHeaderContainer = styled.div`
  margin-bottom: ${odelzaThemeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.lg};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  margin-bottom: ${odelzaThemeCssVariables.spacing[6]};
  text-align: center;
`;

const StyledPermissionsCard = styled.div`
  background: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  margin-bottom: ${odelzaThemeCssVariables.spacing[6]};
  padding: ${odelzaThemeCssVariables.spacing[4]};
`;

const StyledPermissionsTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  margin-bottom: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledPermissionRow = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.md};
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[2]} 0;
`;

const StyledPermissionIcon = styled.div`
  color: ${odelzaThemeCssVariables.color.primary9};
  display: flex;
`;

export const SettingsApplicationInstallPermissionValidationModal = ({
  modalInstanceId,
  appDisplayName,
  appLogoUrl,
  defaultRole,
  onAuthorize,
  isInstalling,
}: SettingsApplicationInstallPermissionValidationModalProps) => {
  const { closeModal } = useModal();

  const permissionItems: PermissionSummaryItem[] = useMemo(() => {
    if (!defaultRole) {
      return [];
    }

    return buildPermissionSummaryFromRoleManifest(defaultRole);
  }, [defaultRole]);

  const handleAuthorize = () => {
    closeModal(modalInstanceId);
    onAuthorize();
  };

  const handleClose = () => {
    closeModal(modalInstanceId);
  };

  return (
    <StyledAppModal
      modalId={modalInstanceId}
      isClosable
      onClose={handleClose}
      size="fullscreen"
      padding="none"
      overlay="transparent"
    >
      <StyledFullscreenContainer>
        <StyledLightButton
          Icon={IconChevronLeft}
          title={t`Back to settings`}
          onClick={handleClose}
        />

        <StyledContent>
          <StyledAppConnectionHeaderContainer>
            <AppConnectionHeader
              appLogoUrl={appLogoUrl}
              appName={appDisplayName}
            />
          </StyledAppConnectionHeaderContainer>

          <StyledTitle>
            {t`Install ${appDisplayName} on your workspace`}
          </StyledTitle>

          {permissionItems.length > 0 && (
            <StyledPermissionsCard>
              <StyledPermissionsTitle>
                {t`${appDisplayName} would like to:`}
              </StyledPermissionsTitle>
              {permissionItems.map((item) => (
                <StyledPermissionRow key={item.label}>
                  <StyledPermissionIcon>
                    <item.Icon size={16} />
                  </StyledPermissionIcon>
                  {item.label}
                </StyledPermissionRow>
              ))}
            </StyledPermissionsCard>
          )}

          <AuthorizeActionButtons
            onCancel={handleClose}
            onAuthorize={handleAuthorize}
            isLoading={isInstalling}
          />
        </StyledContent>
      </StyledFullscreenContainer>
    </StyledAppModal>
  );
};
