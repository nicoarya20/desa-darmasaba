'use client'
import { Button, Stack } from '@mantine/core';
import { Link, RichTextEditor } from '@mantine/tiptap';
import Highlight from '@tiptap/extension-highlight';
import SubScript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';


/**
 * Editor teks PPID. `toolbar="basic"` hanya menampilkan tebal, miring, dan daftar (formulir publik);
 * ekstensi editor — dan karenanya format HTML yang dihasilkan — sama untuk kedua toolbar.
 */
export function PPIDTextEditor({ onSubmit, onChange, showSubmit = true, initialContent = '', toolbar = 'full', }: { 
  onSubmit?: (val: string) => void, 
  onChange: (val: string) => void, 
  showSubmit?: boolean,
  initialContent?: string,
  toolbar?: 'full' | 'basic' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, trailingNode: false }),
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    shouldRerenderOnTransaction: true,
    immediatelyRender: false,
    content: initialContent,
    onUpdate : ({editor}) => {
      onChange(editor.getHTML())
    }
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent || '<p></p>', { emitUpdate: false });
    }
  }, [initialContent, editor]);

  return (
    <Stack >
      <RichTextEditor editor={editor}>
        {toolbar === 'basic' ? (
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
        ) : (
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Highlight />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Subscript />
              <RichTextEditor.Superscript />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
        )}

        <RichTextEditor.Content />
      </RichTextEditor>
      {showSubmit && (
        <Button onClick={() => {
          if (!editor) return
          onSubmit?.(editor?.getHTML())
        }}>Submit</Button>
      )}
    </Stack>
  );
}