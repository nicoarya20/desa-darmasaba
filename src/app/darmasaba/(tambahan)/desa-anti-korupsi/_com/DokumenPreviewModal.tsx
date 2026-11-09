'use client';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { Anchor, Box, Modal } from '@mantine/core';

type Props = { dokumen: DokumenDesaAntiKorupsiView | null; onClose: () => void };

/** Modal pratinjau PDF satu dokumen Desa Anti Korupsi di halaman publik. */
export function DokumenPreviewModal({ dokumen, onClose }: Props) {
  return (
    <Modal opened={dokumen !== null} onClose={onClose} size="xl" title={dokumen?.judul} centered>
      {dokumen && (
        <>
          <Box style={{ border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden', height: '70vh' }}>
            <iframe src={dokumen.file.link} title={dokumen.judul} width="100%" height="100%" style={{ border: 'none' }} />
          </Box>
          <Anchor href={dokumen.file.link} target="_blank" rel="noopener noreferrer" fz="sm" mt="xs" display="inline-block">
            Buka di tab baru
          </Anchor>
        </>
      )}
    </Modal>
  );
}
