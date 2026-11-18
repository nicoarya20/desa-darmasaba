'use client';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import type { PengumumanFile } from '@/lib/pengumuman-lampiran';
import { Anchor, Box, Modal } from '@mantine/core';
import d from './detail/pengumuman-detail.module.css';

/** Label tautan buka PDF di tab baru (juga `data-text` sapuan warna). */
const BUKA_TAB_BARU = 'Buka di tab baru';

/** Modal pratinjau satu lampiran PDF (iframe) + tautan buka di tab baru; tertutup bila `file` null. */
export function PengumumanPdfModal({ file, onClose }: { file: PengumumanFile | null; onClose: () => void }) {
  return (
    <Modal opened={file !== null} onClose={onClose} size="xl" centered title={file?.realName}>
      {file && (
        <>
          <Box className={d.pdfFrame}>
            <iframe src={file.link} title={file.realName} width="100%" height="100%" style={{ border: 'none' }} />
          </Box>
          <Anchor
            href={file.link}
            target="_blank"
            rel="noopener noreferrer"
            fz="sm"
            mt="xs"
            display="inline-block"
            underline="never"
            className={r.trigger}
          >
            <span className={r.cta} data-text={BUKA_TAB_BARU}>
              {BUKA_TAB_BARU}
            </span>
          </Anchor>
        </>
      )}
    </Modal>
  );
}
