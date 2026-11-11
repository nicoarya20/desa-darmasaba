'use client';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import type { PengumumanFile } from '@/lib/pengumuman-lampiran';
import { IconDownload, IconEye, IconFileTypePdf } from '@tabler/icons-react';
import { useState } from 'react';
import { PengumumanPdfModal } from '../PengumumanPdfModal';
import s from './pengumuman-detail.module.css';

/** Lampiran PDF di detail publik: panel baris (ikon · nama + ukuran · Pratinjau · Unduh); kosong → tidak dirender. */
export function PengumumanDokumenRows({ dokumen, label }: { dokumen: readonly PengumumanFile[]; label: string }) {
  const [aktif, setAktif] = useState<PengumumanFile | null>(null);
  const daftar = dokumen.filter((f) => !!f.link);
  if (daftar.length === 0) return null;

  return (
    <>
      <ul className={s.dokumen} aria-label={label}>
        {daftar.map((f) => (
          <li key={f.id} className={s.dokumenRow} data-pengumuman-dokumen>
            <IconFileTypePdf className={s.dokumenIcon} size={30} stroke={1.5} aria-hidden />
            <span className={s.dokumenInfo}>
              <span className={s.dokumenName}>{f.realName}</span>
              {f.size !== null ? <span className={s.dokumenSize}>PDF · {formatUkuran(f.size)}</span> : null}
            </span>
            <span className={s.dokumenActions}>
              <button type="button" className={s.btn} onClick={() => setAktif(f)} aria-label={`Pratinjau ${f.realName}`}>
                <IconEye size={16} stroke={1.75} aria-hidden />
                Pratinjau
              </button>
              <a
                className={`${s.btn} ${s.btnPrimary}`}
                href={f.link}
                download={f.realName}
                aria-label={`Unduh ${f.realName}`}
              >
                <IconDownload size={16} stroke={1.75} aria-hidden />
                Unduh
              </a>
            </span>
          </li>
        ))}
      </ul>
      <PengumumanPdfModal file={aktif} onClose={() => setAktif(null)} />
    </>
  );
}
