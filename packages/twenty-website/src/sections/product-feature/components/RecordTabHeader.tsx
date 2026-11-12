'use client';

import { styled } from '@linaria/react';
import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { RECORD_TABS } from '../data/record-tabs';
import { type RecordTabLabel } from '../types/record-tab-label';

const Bar = styled.div`
  align-items: stretch;
  border-bottom: 1px solid ${ODELZA_THEME_LIGHT.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  height: 40px;
  padding: 0 12px;
`;

const TabButton = styled.div`
  align-items: center;
  color: ${ODELZA_THEME_LIGHT.font.color.secondary};
  display: flex;
  position: relative;

  &::after {
    background-color: transparent;
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }

  &[data-active] {
    color: ${ODELZA_THEME_LIGHT.font.color.primary};
  }

  &[data-active]::after {
    background-color: ${ODELZA_THEME_LIGHT.border.color.inverted};
  }
`;

const TabContent = styled.span`
  align-items: center;
  border-radius: ${ODELZA_THEME_LIGHT.border.radius.sm};
  display: flex;
  font-size: ${previewFontSize(ODELZA_THEME_LIGHT.font.size.md)};
  font-weight: ${ODELZA_THEME_LIGHT.font.weight.medium};
  gap: ${ODELZA_THEME_LIGHT.spacing(1)};
  padding: ${ODELZA_THEME_LIGHT.spacing(1)} ${ODELZA_THEME_LIGHT.spacing(2)};
  white-space: nowrap;

  &:hover {
    background-color: ${ODELZA_THEME_LIGHT.background.tertiary};
  }
`;

export function RecordTabHeader({ active }: { active: RecordTabLabel }) {
  return (
    <Bar>
      {RECORD_TABS.map(({ icon: Icon, label }) => (
        <TabButton data-active={label === active ? '' : undefined} key={label}>
          <TabContent>
            <Icon size={16} stroke={2} />
            {label}
          </TabContent>
        </TabButton>
      ))}
    </Bar>
  );
}
