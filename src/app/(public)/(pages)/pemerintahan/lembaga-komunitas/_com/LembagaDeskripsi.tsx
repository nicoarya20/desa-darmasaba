'use client';
import { useId, useState } from 'react';
import { potongDeskripsi } from './lembaga-komunitas.logic';
import { LEMBAGA_KOMUNITAS_TEXT as T } from './lembaga-komunitas.text';
import s from './lembaga-komunitas.module.css';

/**
 * Deskripsi lembaga (teks biasa, dirender sebagai teks sehingga tanda HTML tidak pernah dieksekusi). Deskripsi panjang
 * tampil ringkas dengan tombol "Selengkapnya" yang membuka teks utuh; yang pendek tampil utuh tanpa tombol.
 */
export function LembagaDeskripsi({ teks }: { teks: string }) {
  const [terbuka, setTerbuka] = useState(false);
  const id = useId();
  const { ringkas, terpotong } = potongDeskripsi(teks);

  return (
    <div className={s.deskripsi}>
      <p id={id} className={terbuka ? s.deskripsiUtuh : s.deskripsiRingkas}>{terbuka || !terpotong ? teks : ringkas}</p>
      {terpotong && (
        <button type="button" className={s.lebih} aria-expanded={terbuka} aria-controls={id} onClick={() => setTerbuka((v) => !v)}>
          {terbuka ? T.tutup : T.selengkapnya}
        </button>
      )}
    </div>
  );
}
