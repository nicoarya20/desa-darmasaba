import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconDownload } from '@tabler/icons-react';
import s from './ppid-file-link.module.css';

/** Berkas PPID dari API (`file` pada Dasar Hukum / Daftar Informasi Publik). */
export type PpidFile = { link: string; realName: string };

/** Teks tautan unduh berkas PPID. */
export const PPID_FILE_TEXT = {
  unduh: 'Unduh PDF',
  unduhLabel: (nama: string) => `Unduh ${nama} (PDF, tab baru)`,
} as const;

type Props = {
  file: PpidFile | null | undefined;
  /** Nama yang dibacakan pembaca layar (mis. jenis informasi); bawaan: nama berkas. */
  subject?: string;
};

/** Tautan "Unduh PDF" ke berkas PPID (tab baru); tanpa berkas tidak merender apa pun, data lama tampil seperti semula. */
export function PpidFileLink({ file, subject }: Props) {
  if (!file) return null;
  return (
    <a
      href={file.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${s.link} ${r.trigger}`}
      aria-label={PPID_FILE_TEXT.unduhLabel(subject || file.realName)}
    >
      <IconDownload size={16} stroke={2} aria-hidden />
      <span className={r.cta} data-text={PPID_FILE_TEXT.unduh}>
        {PPID_FILE_TEXT.unduh}
      </span>
    </a>
  );
}
