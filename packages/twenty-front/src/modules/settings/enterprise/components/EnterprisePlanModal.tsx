import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { SubscriptionBenefit } from '@/settings/billing/components/SubscriptionBenefit';
import { ENTERPRISE_CHECKOUT_SESSION } from '@/settings/enterprise/graphql/queries/enterpriseCheckoutSession';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useApolloClient } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Loader } from 'twenty-ui/feedback';
import { CardPicker, MainButton } from 'twenty-ui/input';
import { ModalContent } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const ENTERPRISE_PLAN_MODAL_ID = 'enterprise-plan-modal';

type BillingInterval = 'monthly' | 'yearly';

const MONTHLY_PRICE = 25;
const YEARLY_PRICE = 19;

const StyledSubscriptionContainer = styled.div`
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  margin: ${odelzaThemeCssVariables.spacing[8]} 0
    ${odelzaThemeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledPriceContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  margin: ${odelzaThemeCssVariables.spacing[4]}
    ${odelzaThemeCssVariables.spacing[3]} 0
    ${odelzaThemeCssVariables.spacing[4]};
  padding-bottom: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledPrice = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.xxl};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  margin-bottom: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledPriceUnit = styled.span`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledBenefitsContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: ${odelzaThemeCssVariables.spacing[4]}
    ${odelzaThemeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledIntervalContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  margin-bottom: ${odelzaThemeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledIntervalCardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledIntervalTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  margin-bottom: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledIntervalSubtitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
`;

export const EnterprisePlanModal = () => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [selectedInterval, setSelectedInterval] =
    useState<BillingInterval>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const client = useApolloClient();

  const benefits = [
    t`SSO (SAML / OIDC)`,
    t`Row-level security`,
    t`Audit logs`,
    t`Advanced Encryption`,
    t`Custom AI Models`,
  ];

  const price = selectedInterval === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
  const priceUnit =
    selectedInterval === 'monthly'
      ? t`seat / month`
      : t`seat / month - billed yearly`;

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      const { data } = await client.query<{
        enterpriseCheckoutSession: string | null;
      }>({
        query: ENTERPRISE_CHECKOUT_SESSION,
        variables: { billingInterval: selectedInterval },
      });

      const checkoutUrl = data?.enterpriseCheckoutSession;

      if (checkoutUrl !== null && checkoutUrl !== undefined) {
        window.open(checkoutUrl, '_blank', 'noopener');
        closeModal(ENTERPRISE_PLAN_MODAL_ID);
      } else {
        enqueueErrorSnackBar({
          message: t`Could not open Stripe. Please contact support.`,
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Error opening Stripe`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={ENTERPRISE_PLAN_MODAL_ID}
      size="medium"
      padding="none"
      isClosable
    >
      <ModalContent isVerticallyCentered>
        <Title noMarginTop>{t`Get Enterprise`}</Title>
        <SubTitle>{t`Enjoy a 30-day free trial`}</SubTitle>

        <StyledSubscriptionContainer>
          <StyledPriceContainer>
            <StyledPrice>{`$${price}`}</StyledPrice>
            <StyledPriceUnit>{priceUnit}</StyledPriceUnit>
          </StyledPriceContainer>
          <StyledBenefitsContainer>
            {benefits.map((benefit) => (
              <SubscriptionBenefit key={benefit}>{benefit}</SubscriptionBenefit>
            ))}
          </StyledBenefitsContainer>
        </StyledSubscriptionContainer>

        <StyledIntervalContainer>
          <CardPicker
            checked={selectedInterval === 'monthly'}
            handleChange={() => setSelectedInterval('monthly')}
          >
            <StyledIntervalCardContent>
              <StyledIntervalTitle>{t`Monthly`}</StyledIntervalTitle>
              <StyledIntervalSubtitle>{`$${MONTHLY_PRICE} / ${t`seat / month`}`}</StyledIntervalSubtitle>
            </StyledIntervalCardContent>
          </CardPicker>
          <CardPicker
            checked={selectedInterval === 'yearly'}
            handleChange={() => setSelectedInterval('yearly')}
          >
            <StyledIntervalCardContent>
              <StyledIntervalTitle>{t`Yearly`}</StyledIntervalTitle>
              <StyledIntervalSubtitle>{`$${YEARLY_PRICE} / ${t`seat / month`}`}</StyledIntervalSubtitle>
            </StyledIntervalCardContent>
          </CardPicker>
        </StyledIntervalContainer>

        <MainButton
          title={t`Continue`}
          onClick={handleContinue}
          width={200}
          Icon={() => isLoading && <Loader />}
          disabled={isLoading}
        />
      </ModalContent>
    </ModalStatefulWrapper>
  );
};
