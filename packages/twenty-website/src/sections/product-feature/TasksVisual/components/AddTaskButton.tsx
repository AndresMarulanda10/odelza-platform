'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconPlus } from '@tabler/icons-react';
import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

const Button = styled.div`
  align-items: center;
  background-color: transparent;
  border: 1px solid ${ODELZA_THEME_LIGHT.background.transparent.medium};
  border-radius: ${ODELZA_THEME_LIGHT.border.radius.sm};
  box-sizing: border-box;
  color: ${ODELZA_THEME_LIGHT.font.color.secondary};
  display: inline-flex;
  flex-shrink: 0;
  font-size: ${previewFontSize(ODELZA_THEME_LIGHT.font.size.md)};
  font-weight: ${ODELZA_THEME_LIGHT.font.weight.medium};
  gap: ${ODELZA_THEME_LIGHT.spacing(1)};
  height: 24px;
  padding: 0 ${ODELZA_THEME_LIGHT.spacing(2)};
  white-space: nowrap;
`;

export function AddTaskButton() {
  const { i18n } = useLingui();
  return (
    <Button>
      <IconPlus size={14} stroke={2} />
      {i18n._(msg`Add task`)}
    </Button>
  );
}
