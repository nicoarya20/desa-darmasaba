// TestEditor.tsx
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { useEffect } from 'react';
import { editorImageExtension, type PickEditorImage } from './editor-image/editor-image';
import imageCss from './editor-image/editor-image.module.css';
import { SisipkanGambarControl } from './editor-image/SisipkanGambarControl';

type CreateEditorProps = {
  value: string;
  onChange: (content: string) => void;
  /** Diisi → editor menerima gambar sisipan (tombol "Sisipkan gambar"); kosong → editor teks saja seperti biasa. */
  onPickImage?: PickEditorImage;
};

export default function CreateEditor({ value, onChange, onPickImage }: CreateEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, trailingNode: false }),
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ...(onPickImage ? [editorImageExtension] : []),
    ],
    shouldRerenderOnTransaction: true,
    content: value,
    onUpdate: () => {
      if (editor) {
        onChange(editor.getHTML());
      }
    },
  });

  // 👇 Tambahkan efek untuk sinkronisasi value dari luar (resetForm)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <RichTextEditor editor={editor} classNames={onPickImage ? { content: imageCss.content } : undefined}>
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

        {onPickImage ? (
          <RichTextEditor.ControlsGroup>
            <SisipkanGambarControl onPick={onPickImage} />
          </RichTextEditor.ControlsGroup>
        ) : null}

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  );
}