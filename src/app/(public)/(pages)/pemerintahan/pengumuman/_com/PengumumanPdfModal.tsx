'use client';
import type { PengumumanFile } from '@/lib/pengumuman-lampiran';
import { Anchor, Box, Modal } from '@mantine/core';

/** Modal pratinjau satu lampiran PDF (iframe) + tautan buka di tab baru; tertutup bila `file` null. */
export function PengumumanPdfModal({ file, onClose }: { file: PengumumanFile | null; onClose: () => void }) {
  return (
    <Modal opened={file !== null} onClose={onClose} size="xl" centered title={file?.realName}>
      {file && (
        <>
          <Box style={{ border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden', height: '70vh' }}>
            <iframe src={file.link} title={file.realName} width="100%" height="100%" style={{ border: 'none' }} />
          </Box>
          <Anchor href={file.link} target="_blank" rel="noopener noreferrer" fz="sm" mt="xs" display="inline-block">
            Buka di tab baru
          </Anchor>
        </>
      )}
    </Modal>
  );
}
