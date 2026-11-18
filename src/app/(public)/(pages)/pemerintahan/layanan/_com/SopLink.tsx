import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconFileTypePdf } from '@tabler/icons-react';
import type { SopFile } from './layanan.logic';
import page from './layanan.module.css';
import s from './layanan-sop.module.css';
import { LAYANAN_TEXT } from './layanan.text';

const T = LAYANAN_TEXT.sop;

/** Tautan "Unduh SOP (PDF)" ke berkas SOP layanan (FileStorage); dibuka di tab baru. Render hanya bila layanan punya berkas. */
export function SopLink({ file }: { file: SopFile }) {
  return (
    <a className={`${s.sop} ${r.trigger}`} href={file.link} target="_blank" rel="noopener noreferrer">
      <IconFileTypePdf size={20} stroke={1.6} aria-hidden />
      <span className={r.cta} data-text={T.label}>
        {T.label}
      </span>
      <span className={page.srOnly}>({T.linkHint})</span>
    </a>
  );
}
