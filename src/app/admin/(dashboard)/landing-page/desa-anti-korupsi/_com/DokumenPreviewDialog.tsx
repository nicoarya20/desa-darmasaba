'use client';
import { Modal } from '@mantine/core';
import { DokumenPreviewFrame } from './DokumenPreviewFrame';

/** Sumber pratinjau PDF: link server atau object URL berkas lokal. */
export type DokumenPreviewSource = { src: string; title: string };

/** Pratinjau PDF dokumen dalam modal (bukan inline) agar halaman admin tidak memanjang. */
export function DokumenPreviewDialog({ preview, onClose }: { preview: DokumenPreviewSource | null; onClose: () => void }) {
  return (
    <Modal opened={preview !== null} onClose={onClose} size="xl" centered title="Pratinjau dokumen">
      {preview && <DokumenPreviewFrame src={preview.src} title={preview.title} />}
    </Modal>
  );
}
