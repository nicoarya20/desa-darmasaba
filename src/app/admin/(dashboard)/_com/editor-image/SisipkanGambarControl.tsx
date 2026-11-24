'use client';
import { RichTextEditor, useRichTextEditorContext } from '@mantine/tiptap';
import { IconPhotoPlus } from '@tabler/icons-react';
import { useRef } from 'react';
import type { PickEditorImage } from './editor-image';

const LABEL = 'Sisipkan gambar di posisi kursor';

/** Tombol toolbar: pilih satu berkas gambar lalu sisipkan di posisi kursor editor. */
export function SisipkanGambarControl({ onPick }: { onPick: PickEditorImage }) {
  const { editor } = useRichTextEditorContext();
  const input = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    // Kosongkan supaya memilih berkas yang sama dua kali tetap memicu onChange.
    event.currentTarget.value = '';
    if (!file || !editor) return;
    const src = onPick(file);
    if (src) editor.chain().focus().setImage({ src, alt: '' }).run();
  };

  return (
    <>
      <RichTextEditor.Control onClick={() => input.current?.click()} aria-label={LABEL} title={LABEL}>
        <IconPhotoPlus stroke={1.5} size={16} />
      </RichTextEditor.Control>
      <input ref={input} type="file" accept="image/*" hidden onChange={handleChange} />
    </>
  );
}
