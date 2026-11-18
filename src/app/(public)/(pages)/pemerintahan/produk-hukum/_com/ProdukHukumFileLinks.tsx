import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import type { ProdukHukumFileRef } from '@/lib/produk-hukum';
import { IconDownload, IconEye } from '@tabler/icons-react';
import { PRODUK_HUKUM_TEXT as T } from './produk-hukum.text';
import s from './produk-hukum.module.css';

type Props = { judul: string; file: ProdukHukumFileRef | null };

/**
 * Sel File: tautan "Lihat" (tab baru; server melayani PDF inline) dan "Unduh" (atribut `download` pada tautan satu-asal,
 * tersimpan dengan nama aslinya). Tanpa berkas tidak ada tombol, hanya keterangan "Belum tersedia".
 */
export function ProdukHukumFileLinks({ judul, file }: Props) {
  if (!file) return <span className={s.fileEmpty}>{T.fileKosong}</span>;
  return (
    <span className={s.fileLinks}>
      <a
        href={file.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`${s.fileLink} ${r.trigger}`}
        aria-label={T.lihatLabel(judul)}
      >
        <IconEye size={16} stroke={2} aria-hidden />
        <span className={r.cta} data-text={T.lihat}>{T.lihat}</span>
      </a>
      <a
        href={file.link}
        download={file.realName}
        className={`${s.fileLink} ${r.trigger}`}
        aria-label={T.unduhLabel(judul)}
      >
        <IconDownload size={16} stroke={2} aria-hidden />
        <span className={r.cta} data-text={T.unduh}>{T.unduh}</span>
      </a>
    </span>
  );
}
