import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPhoto } from 'twenty-ui/icon';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledCard = styled.div`
  background: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
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
    box-shadow: ${odelzaThemeCssVariables.boxShadow.light};
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 1px solid ${odelzaThemeCssVariables.border.color.accent};
    outline-offset: 1px;
  }
`;

const StyledImageFrame = styled.div`
  align-items: center;
  aspect-ratio: 3 / 2;
  background: ${odelzaThemeCssVariables.background.tertiary};
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
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
`;

const StyledInitial = styled.span`
  font-size: ${odelzaThemeCssVariables.font.size.xxl};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  text-transform: uppercase;
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  padding: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledTitle = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSubtitle = styled.span`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDetail = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PLACEHOLDER_ICON_SIZE = 48;

export type RecordCatalogCardProps = {
  imageSrc?: string;
  imageAlt?: string;
  isCompact?: boolean;
  title: string;
  subtitle?: string;
  detail?: string;
  fields?: ReactNode;
  onClick?: () => void;
};

export const RecordCatalogCard = ({
  imageSrc,
  imageAlt,
  isCompact = false,
  title,
  subtitle,
  detail,
  fields,
  onClick,
}: RecordCatalogCardProps) => {
  const initial = title.trim().slice(0, 1);

  return (
    <StyledCard
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault();
          onClick?.();
        }
      }}
      title={title}
    >
      {!isCompact && (
        <StyledImageFrame>
          {isDefined(imageSrc) && imageSrc.trim() !== '' ? (
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
      )}
      <StyledBody>
        <StyledTitle>{title}</StyledTitle>
        {!isCompact && isDefined(subtitle) && (
          <StyledSubtitle>{subtitle}</StyledSubtitle>
        )}
        {!isCompact && isDefined(detail) && (
          <StyledDetail>{detail}</StyledDetail>
        )}
        {!isCompact && fields}
      </StyledBody>
    </StyledCard>
  );
};
