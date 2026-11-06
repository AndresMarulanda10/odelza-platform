import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/object-record/record-field/ui/form-types/constants/FormFieldPlaceholderStyles';
import { styled } from '@linaria/react';
import { EditorContent, type Editor } from '@tiptap/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledEditor = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  height: 100%;
  padding-right: ${({ multiline }) =>
    multiline ? odelzaThemeCssVariables.spacing[8] : '0'};
  width: 100%;
  .editor-content {
    width: 100%;
  }

  .tiptap {
    align-items: ${({ multiline }) => (multiline ? 'flex-start' : 'center')};
    border: none !important;
    box-sizing: border-box;
    color: ${({ readonly }) =>
      readonly
        ? odelzaThemeCssVariables.font.color.light
        : odelzaThemeCssVariables.font.color.primary};
    display: flex;
    font-family: ${odelzaThemeCssVariables.font.family};
    font-weight: ${odelzaThemeCssVariables.font.weight.regular};
    &::-webkit-scrollbar {
      display: none;
    }
    height: ${({ multiline }) => (multiline ? 'auto' : '100%')};
    overflow-x: auto;
    overflow-y: hidden;
    padding: ${odelzaThemeCssVariables.spacing[1]}
      ${odelzaThemeCssVariables.spacing[2]};
    scrollbar-width: none;
    white-space: ${({ multiline }) => (multiline ? 'pre' : 'nowrap')};

    p.is-editor-empty:first-of-type::before {
      ${FORM_FIELD_PLACEHOLDER_STYLES}
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    p {
      margin: 0;
    }

    .variable-tag {
      background-color: ${odelzaThemeCssVariables.color.primary3};
      border-radius: ${odelzaThemeCssVariables.border.radius.md};
      color: ${odelzaThemeCssVariables.color.primary};
      padding: ${odelzaThemeCssVariables.spacing[1]};
    }

    .text-tag {
      background-color: ${odelzaThemeCssVariables.color.primary3};
      border-radius: ${odelzaThemeCssVariables.border.radius.md};
      color: ${odelzaThemeCssVariables.color.primary};
      padding: ${odelzaThemeCssVariables.spacing[1]};
    }
  }

  .ProseMirror-focused {
    outline: none;
  }
`;

type TextVariableEditorProps = {
  multiline: boolean | undefined;
  readonly: boolean | undefined;
  editor: Editor;
};

export const TextVariableEditor = ({
  multiline,
  readonly,
  editor,
}: TextVariableEditorProps) => {
  return (
    <StyledEditor multiline={multiline} readonly={readonly}>
      <EditorContent className="editor-content" editor={editor} />
    </StyledEditor>
  );
};
