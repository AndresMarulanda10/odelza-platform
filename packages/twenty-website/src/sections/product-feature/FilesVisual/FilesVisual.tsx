'use client';

import { styled } from '@linaria/react';
import { IconPlus } from '@tabler/icons-react';
import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { RecordTabHeader } from '../components/RecordTabHeader';
import { FileRow } from './components/FileRow';
import { FILES } from './data/files';

const Root = styled.div`
  background-color: ${ODELZA_THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: var(--font-product), sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Panel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding-top: 8px;
`;

const TitleBar = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 8px 16px 12px;
`;

const Title = styled.span`
  align-items: baseline;
  color: ${ODELZA_THEME_LIGHT.font.color.primary};
  display: flex;
  font-size: ${previewFontSize(ODELZA_THEME_LIGHT.font.size.lg)};
  font-weight: ${ODELZA_THEME_LIGHT.font.weight.semiBold};
`;

const Count = styled.span`
  color: ${ODELZA_THEME_LIGHT.font.color.light};
  margin-left: 8px;
`;

const AddButton = styled.span`
  align-items: center;
  border: 1px solid ${ODELZA_THEME_LIGHT.border.color.medium};
  border-radius: ${ODELZA_THEME_LIGHT.border.radius.sm};
  color: ${ODELZA_THEME_LIGHT.font.color.secondary};
  display: inline-flex;
  font-size: ${previewFontSize(ODELZA_THEME_LIGHT.font.size.sm)};
  font-weight: ${ODELZA_THEME_LIGHT.font.weight.medium};
  gap: 4px;
  padding: 4px 8px;
`;

const FileCard = styled.div`
  border: 1px solid ${ODELZA_THEME_LIGHT.border.color.medium};
  border-radius: ${ODELZA_THEME_LIGHT.border.radius.sm};
  margin: 0 16px;
  overflow: hidden;

  & > * + * {
    border-top: 1px solid ${ODELZA_THEME_LIGHT.border.color.light};
  }
`;

export function FilesVisual({ active: _active }: { active: boolean }) {
  return (
    <Root>
      <RecordTabHeader active="Files" />
      <Panel>
        <TitleBar>
          <Title>
            All
            <Count>{FILES.length}</Count>
          </Title>
          <AddButton>
            <IconPlus size={12} stroke={2} />
            Add file
          </AddButton>
        </TitleBar>
        <FileCard>
          {FILES.map((file) => (
            <FileRow key={file.name} file={file} />
          ))}
        </FileCard>
      </Panel>
    </Root>
  );
}
