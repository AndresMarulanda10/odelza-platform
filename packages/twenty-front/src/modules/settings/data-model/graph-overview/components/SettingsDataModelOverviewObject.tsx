import { styled } from '@linaria/react';
import { type Node, type NodeProps } from '@xyflow/react';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectFieldRow } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewField';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { ObjectFieldRowWithoutRelation } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewFieldWithoutRelation';
import '@xyflow/react/dist/style.css';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

type SettingsDataModelOverviewObjectNode = Node<
  EnrichedObjectMetadataItem,
  'object'
>;
type SettingsDataModelOverviewObjectProps =
  NodeProps<SettingsDataModelOverviewObjectNode>;

const StyledNode = styled.div`
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[2]};
  width: 220px;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledObjectName = styled.div`
  border: 0;
  border-radius: ${odelzaThemeCssVariables.border.radius.sm}
    ${odelzaThemeCssVariables.border.radius.sm} 0 0;
  display: flex;
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  position: relative;
  text-align: center;
`;

const StyledInnerCard = styled.div`
  background-color: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  flex-flow: column nowrap;
  gap: ${odelzaThemeCssVariables.spacing['0.5']};
  padding: ${odelzaThemeCssVariables.spacing[2]} 0
    ${odelzaThemeCssVariables.spacing[2]} 0;
`;

const StyledCardRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: 24px;
`;

const StyledCardRowOther = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  height: 24px;
  padding: 0 ${odelzaThemeCssVariables.spacing[2]};

  &:hover {
    background-color: ${odelzaThemeCssVariables.background.tertiary};
  }
`;

const StyledCardRowText = styled.div``;

const StyledObjectInstanceCount = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
`;

const StyledObjectLinkContainer = styled.div`
  > a {
    align-items: center;
    color: ${odelzaThemeCssVariables.font.color.primary};
    display: flex;
    gap: ${odelzaThemeCssVariables.spacing[1]};
    text-decoration: none;

    &:hover {
      color: ${odelzaThemeCssVariables.font.color.secondary};
    }
  }
`;

export const SettingsDataModelOverviewObject = ({
  data: objectMetadataItem,
}: SettingsDataModelOverviewObjectProps) => {
  const { theme } = useContext(ThemeContext);
  const { formatNumber } = useNumberFormat();
  const [otherFieldsExpanded, setOtherFieldsExpanded] = useState(false);

  const { totalCount } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const fields = objectMetadataItem.fields.filter(
    (x) => !isHiddenSystemField(x) && x.isActive,
  );

  const countNonRelation = fields.filter(
    (x) => x.type !== FieldMetadataType.RELATION,
  ).length;

  return (
    <StyledNode>
      <StyledHeader>
        <StyledObjectName onMouseEnter={() => {}} onMouseLeave={() => {}}>
          <StyledObjectLinkContainer>
            <Link
              to={getSettingsPath(SettingsPath.Objects, {
                objectNamePlural: objectMetadataItem.namePlural,
              })}
            >
              <ObjectMetadataIcon
                objectMetadataItem={objectMetadataItem}
                size={theme.icon.size.md}
              />
              {objectMetadataItem.labelPlural}
            </Link>
          </StyledObjectLinkContainer>
          <StyledObjectInstanceCount>
            {' '}
            · {isDefined(totalCount) ? formatNumber(totalCount) : totalCount}
          </StyledObjectInstanceCount>
        </StyledObjectName>
        <SettingsItemTypeTag item={objectMetadataItem} />
      </StyledHeader>

      <StyledInnerCard>
        {fields
          .filter((x) => x.type === FieldMetadataType.RELATION)
          .map((field) => (
            <StyledCardRow key={field.id}>
              <ObjectFieldRow field={field} />
            </StyledCardRow>
          ))}
        {countNonRelation > 0 && (
          <>
            <StyledCardRowOther
              onClick={() => setOtherFieldsExpanded(!otherFieldsExpanded)}
            >
              {otherFieldsExpanded ? (
                <IconChevronUp size={theme.icon.size.md} />
              ) : (
                <IconChevronDown size={theme.icon.size.md} />
              )}
              <StyledCardRowText>{countNonRelation} fields</StyledCardRowText>
            </StyledCardRowOther>
            {otherFieldsExpanded &&
              fields
                .filter((x) => x.type !== FieldMetadataType.RELATION)
                .map((field) => (
                  <StyledCardRow key={field.id}>
                    <ObjectFieldRowWithoutRelation field={field} />
                  </StyledCardRow>
                ))}
          </>
        )}
      </StyledInnerCard>
    </StyledNode>
  );
};
