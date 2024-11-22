import React, { useCallback, useState } from 'react';
import { Form } from '@douyinfe/semi-ui';
import type { BaseFieldProps } from '../FieldForm';
import { RichTextEditorContent } from '@lark-project/js-sdk';
import './richTextPreview.css';
import { sdk } from '../../../../../utils/jssdk';
import { useSdkContext } from '../../../../../common/hooks';
interface IRichTextEditorResult {
  confirmed: boolean;
  canceled: boolean;
  content?: RichTextEditorContent;
}

const filterHTMLContent = htmlContent => {
  return htmlContent.replace(/<script[\s\S]*?<\/script>/g, '');
};

const getSelected = (): string | undefined => {
  if (window.getSelection) {
    return window.getSelection()?.toString();
  } else if (document.getSelection) {
    return document.getSelection()?.toString();
  }     
  return undefined;
};

export function FieldRichText({ onUpdate, ...props }: BaseFieldProps) {
  const { field, label } = props;
  const sdkContext = useSdkContext();
  const [docContent, setDocContent] = useState<string>();
  const [docHTMLContent, setDocHTMLContent] = useState<string>();
  const onRichTextChange = async (value: IRichTextEditorResult) => {
    await onUpdate({
      field_key: field,
      field_value: value,
    });
  };
  const openRichTextEditor = useCallback(async () => {
    try {
      const { spaceId } = sdkContext?.activeWorkItem ?? {};
      if (getSelected() || !spaceId) {
        return;
      }
      sdk.richTextEditor.show(
        {
          title: label,
          defaultValue: docContent,
          context: {
            spaceId: spaceId!,
          },
        },
        result => {
          const { confirmed, nextValue } = result ?? {};
          if (confirmed) {
            onRichTextChange(result);
            setDocContent(nextValue?.doc);
            setDocHTMLContent(nextValue?.doc_html);
          }
        },
      );
    } catch (e) {
      sdk.toast.error(e.message);
    }
  }, [sdkContext?.activeWorkItem, label, docContent, setDocHTMLContent, onRichTextChange]);
  return (
    <Form.Slot label={label}>
      <div
        style={{
          overflow: 'hidden',
          minHeight: 80,
          alignItems: 'flex-start',
          display: 'flex',
          padding: 12,
          borderRadius: 6,
          border: '1px solid var(--semi-color-border)',
          cursor: 'pointer',
        }}
        onClick={openRichTextEditor}
      >
        <div
          className="innerdocbody editor-kit-container"
          dangerouslySetInnerHTML={{ __html: filterHTMLContent(docHTMLContent ?? '') }}
        />
      </div>
    </Form.Slot>
  );
}
