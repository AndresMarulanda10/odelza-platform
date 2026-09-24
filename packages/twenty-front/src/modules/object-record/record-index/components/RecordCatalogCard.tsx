import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCard = styled.button`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  text-align: left;
  transition:
    box-shadow 120ms ease,
    transform 120ms ease;
  width: 100%;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.light};
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 1px solid ${themeCssVariables.border.color.blue};
    outline-offset: 1px;
  }
`;

const StyledImageFrame = styled.div`
  background: ${themeCssVariables.background.tertiary};
  overflow: hidden;
  position: relative;
  width: 100%;

  &::before {
    content: '';
    display: block;
    padding-top: 66%;
  }
`;

const StyledImage = styled.img`
  height: 100%;
  inset: 0;
  object-fit: cover;
  position: absolute;
  width: 100%;
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSubtitle = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDetail = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export type RecordCatalogCardProps = {
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  detail?: string;
  onClick?: () => void;
};

export const RecordCatalogCard = ({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  detail,
  onClick,
}: RecordCatalogCardProps) => (
  <StyledCard type="button" onClick={onClick} title={title}>
    {isDefined(imageSrc) && (
      <StyledImageFrame>
        <StyledImage alt={imageAlt ?? ''} loading="lazy" src={imageSrc} />
      </StyledImageFrame>
    )}
    <StyledBody>
      <StyledTitle>{title}</StyledTitle>
      {isDefined(subtitle) && <StyledSubtitle>{subtitle}</StyledSubtitle>}
      {isDefined(detail) && <StyledDetail>{detail}</StyledDetail>}
    </StyledBody>
  </StyledCard>
);
