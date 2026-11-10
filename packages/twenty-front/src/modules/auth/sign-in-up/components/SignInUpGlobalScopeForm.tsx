import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';
import { ClickToActionLink, UndecoratedLink } from 'twenty-ui/navigation';

import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { SignInUpWithCredentials } from '@/auth/sign-in-up/components/internal/SignInUpWithCredentials';
import { SignInUpWithGoogle } from '@/auth/sign-in-up/components/internal/SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from '@/auth/sign-in-up/components/internal/SignInUpWithMicrosoft';
import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { getAvailableWorkspacePathAndSearchParams } from '@/auth/utils/availableWorkspacesUtils';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { Avatar } from 'twenty-ui/data-display';
import { IconChevronRight, IconPlus } from 'twenty-ui/icon';
import { HorizontalSeparator } from 'twenty-ui/layout';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';
import {
  type AvailableWorkspace,
  GetWorkspaceCreationDefaultsDocument,
} from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledContentContainer = styled(StyledOnboardingContentContainer)`
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledWorkspaceContainer = styled.div`
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;

  > * {
    border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.medium};

    &:last-child {
      border-bottom: none;
    }
  }
`;

const StyledWorkspaceItem = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: ${odelzaThemeCssVariables.spacing[15]};
  justify-content: space-between;
  overflow: hidden;

  padding: 0;
  width: 100%;

  &:hover {
    background-color: ${odelzaThemeCssVariables.background.transparent.light};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StyledWorkspaceContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[4]};
  padding: 0 ${odelzaThemeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledWorkspaceTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledWorkspaceLogo = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.transparent.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  display: flex;
  height: ${odelzaThemeCssVariables.spacing[6]};
  justify-content: center;
  width: ${odelzaThemeCssVariables.spacing[6]};
`;

const StyledWorkspaceName = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  padding-bottom: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledWorkspaceUrl = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
`;

const StyledChevronIcon = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
`;

const StyledForgotPasswordLinkContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: ${odelzaThemeCssVariables.spacing[4]};
`;

export const SignInUpGlobalScopeForm = () => {
  const { theme } = useContext(ThemeContext);
  const authProviders = useAtomStateValue(authProvidersState);
  const isDDLLocked = useAtomStateValue(isDDLLockedState);
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const setSignInUpStep = useSetAtomState(signInUpStepState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const availableWorkspaces = useAtomStateValue(availableWorkspacesState);
  const { t } = useLingui();

  const { form } = useSignInUpForm();
  const { handleResetPassword } = useHandleResetPassword();
  const returnToPath = useAtomStateValue(returnToPathState);

  useQuery(GetWorkspaceCreationDefaultsDocument, {
    skip: signInUpStep !== SignInUpStep.WorkspaceSelection,
  });

  const getAvailableWorkspaceUrl = (availableWorkspace: AvailableWorkspace) => {
    const { pathname, searchParams } = getAvailableWorkspacePathAndSearchParams(
      availableWorkspace,
      { email: form.getValues('email') },
    );

    return buildWorkspaceUrl(
      getWorkspaceUrl(availableWorkspace.workspaceUrls),
      pathname,
      {
        ...searchParams,
        ...(isNonEmptyString(returnToPath) ? { returnToPath } : {}),
      },
    );
  };

  const availableWorkspacesList = [
    ...availableWorkspaces.availableWorkspacesForSignIn,
    ...availableWorkspaces.availableWorkspacesForSignUp,
  ];

  return (
    <>
      {signInUpStep === SignInUpStep.WorkspaceSelection && (
        <StyledContentContainer>
          <StyledWorkspaceContainer>
            {availableWorkspacesList.map((availableWorkspace, index) => (
              <OnboardingStepAnimatedItem
                key={availableWorkspace.id}
                index={index}
              >
                <UndecoratedLink
                  to={getAvailableWorkspaceUrl(availableWorkspace)}
                >
                  <StyledWorkspaceItem>
                    <StyledWorkspaceContent>
                      <Avatar
                        placeholder={availableWorkspace.displayName || ''}
                        avatarUrl={getAbsoluteImageUrl(
                          availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO,
                        )}
                        size="lg"
                      />
                      <StyledWorkspaceTextContainer>
                        <StyledWorkspaceName>
                          {availableWorkspace.displayName ||
                            availableWorkspace.id}
                        </StyledWorkspaceName>
                        <StyledWorkspaceUrl>
                          {
                            new URL(
                              getWorkspaceUrl(availableWorkspace.workspaceUrls),
                            ).hostname
                          }
                        </StyledWorkspaceUrl>
                      </StyledWorkspaceTextContainer>
                      <StyledChevronIcon>
                        <IconChevronRight size={theme.icon.size.md} />
                      </StyledChevronIcon>
                    </StyledWorkspaceContent>
                  </StyledWorkspaceItem>
                </UndecoratedLink>
              </OnboardingStepAnimatedItem>
            ))}
            {!isDDLLocked && (
              <OnboardingStepAnimatedItem
                index={availableWorkspacesList.length}
              >
                <StyledWorkspaceItem
                  onClick={() =>
                    setSignInUpStep(SignInUpStep.WorkspaceCreation)
                  }
                >
                  <StyledWorkspaceContent>
                    <StyledWorkspaceLogo>
                      <IconPlus size={theme.icon.size.lg} />
                    </StyledWorkspaceLogo>
                    <StyledWorkspaceTextContainer>
                      <StyledWorkspaceName>{t`Create a workspace`}</StyledWorkspaceName>
                    </StyledWorkspaceTextContainer>
                    <StyledChevronIcon>
                      <IconChevronRight size={theme.icon.size.md} />
                    </StyledChevronIcon>
                  </StyledWorkspaceContent>
                </StyledWorkspaceItem>
              </OnboardingStepAnimatedItem>
            )}
          </StyledWorkspaceContainer>
        </StyledContentContainer>
      )}
      {signInUpStep !== SignInUpStep.WorkspaceSelection && (
        <StyledContentContainer>
          {authProviders.google && (
            <SignInUpWithGoogle
              action="list-available-workspaces"
              isGlobalScope
            />
          )}
          {authProviders.microsoft && (
            <SignInUpWithMicrosoft
              action="list-available-workspaces"
              isGlobalScope
            />
          )}
          {(authProviders.google || authProviders.microsoft) && (
            <HorizontalSeparator
              color={odelzaThemeCssVariables.background.transparent.light}
            />
          )}
          {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
          <FormProvider {...form}>
            <SignInUpWithCredentials isGlobalScope />
          </FormProvider>
          {signInUpStep === SignInUpStep.Password && (
            <StyledForgotPasswordLinkContainer>
              <ClickToActionLink
                onClick={handleResetPassword(form.getValues('email'))}
              >
                <Trans>Forgot your password?</Trans>
              </ClickToActionLink>
            </StyledForgotPasswordLinkContainer>
          )}
        </StyledContentContainer>
      )}
    </>
  );
};
