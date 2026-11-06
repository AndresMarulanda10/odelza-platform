import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Suspense, lazy } from 'react';
import { Section } from 'twenty-ui/layout';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

const StyledPreviewFrame = styled.div`
  background: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: flex;
  height: 600px;
  overflow: auto;
  width: 100%;
`;

const StyledHeadlessNotice = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  height: 100%;
  justify-content: center;
  padding: ${odelzaThemeCssVariables.spacing[6]};
  text-align: center;
  width: 100%;
`;

const StyledHeadlessTitle = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledRendererContainer = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
`;

type SettingsApplicationFrontComponentPreviewTabProps = {
  frontComponentId: string;
  isHeadless: boolean;
};

export const SettingsApplicationFrontComponentPreviewTab = ({
  frontComponentId,
  isHeadless,
}: SettingsApplicationFrontComponentPreviewTabProps) => {
  return (
    <Section>
      <StyledPreviewFrame>
        {isHeadless ? (
          <StyledHeadlessNotice>
            <StyledHeadlessTitle>{t`Headless component`}</StyledHeadlessTitle>
            <span>{t`This component runs without a UI and renders nothing here.`}</span>
          </StyledHeadlessNotice>
        ) : (
          <StyledRendererContainer>
            <Suspense fallback={null}>
              <FrontComponentRenderer frontComponentId={frontComponentId} />
            </Suspense>
          </StyledRendererContainer>
        )}
      </StyledPreviewFrame>
    </Section>
  );
};
