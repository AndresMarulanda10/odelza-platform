'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { MappingRow } from './components/MappingRow';
import { MAPPINGS } from './data/import-mappings';

const Root = styled.div`
  background-color: ${ODELZA_THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: var(--font-product), sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const HeaderRow = styled.div`
  background-color: ${ODELZA_THEME_LIGHT.background.secondary};
  border-bottom: 1px solid ${ODELZA_THEME_LIGHT.border.color.medium};
  display: flex;
  flex-shrink: 0;
  min-height: 40px;
`;

const HeaderCell = styled.span`
  align-items: center;
  color: ${ODELZA_THEME_LIGHT.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${previewFontSize(ODELZA_THEME_LIGHT.font.size.md)};
  font-weight: ${ODELZA_THEME_LIGHT.font.weight.semiBold};
  padding: 0 16px;
`;

export function ImportVisual({ active: _active }: { active: boolean }) {
  const { i18n } = useLingui();
  return (
    <Root>
      <HeaderRow>
        <HeaderCell>{i18n._(msg`Imported data`)}</HeaderCell>
        <HeaderCell>{i18n._(msg`Twenty fields`)}</HeaderCell>
      </HeaderRow>
      {MAPPINGS.map((mapping) => (
        <MappingRow key={mapping.header} mapping={mapping} />
      ))}
    </Root>
  );
}
