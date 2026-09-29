import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconPhoto } from 'twenty-ui/icon';
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
  align-items: center;
  aspect-ratio: 3 / 2;
  background: ${themeCssVariables.background.tertiary};
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledImage = styled.img`
  height: 100%;
  inset: 0;
  object-fit: cover;
  position: absolute;
  width: 100%;
`;

/* Hueco de los registros sin foto: la inicial del titulo o un icono. */
const StyledPlaceholder = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
`;

const StyledInitial = styled.span`
  font-size: ${themeCssVariables.font.size.xxl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-transform: uppercase;
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

const PLACEHOLDER_ICON_SIZE = 48;

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
}: RecordCatalogCardProps) => {
  const initial = title.trim().slice(0, 1);

  return (
    <StyledCard type="button" onClick={onClick} title={title}>
      <StyledImageFrame>
        {isDefined(imageSrc) ? (
          <StyledImage alt={imageAlt ?? ''} loading="lazy" src={imageSrc} />
        ) : (
          <StyledPlaceholder>
            {initial === '' ? (
              <IconPhoto aria-hidden size={PLACEHOLDER_ICON_SIZE} />
            ) : (
              <StyledInitial aria-hidden="true">{initial}</StyledInitial>
            )}
          </StyledPlaceholder>
        )}
      </StyledImageFrame>
      <StyledBody>
        <StyledTitle>{title}</StyledTitle>
        {isDefined(subtitle) && <StyledSubtitle>{subtitle}</StyledSubtitle>}
        {isDefined(detail) && <StyledDetail>{detail}</StyledDetail>}
      </StyledBody>
    </StyledCard>
  );
};
