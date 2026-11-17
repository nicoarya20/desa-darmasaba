import { formatJumlah } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { formatSelisih, type DinamikaRow } from '@/lib/dinamika-penduduk';
import { IconChevronDown } from '@tabler/icons-react';
import { dinamikaNeraca } from './dinamika.logic';
import s from './dinamika.module.css';
import { DINAMIKA_TEXT as T } from './dinamika.text';

const KOLOM = [
  { key: 'kelahiran', label: T.kelahiran },
  { key: 'kematian', label: T.kematian },
  { key: 'masuk', label: T.masuk },
  { key: 'keluar', label: T.keluar },
] as const;

/**
 * Riwayat semua tahun di balik `<details>` (tertutup bawaan, bisa dibuka keyboard). Desktop = tabel;
 * ponsel ≤734px = tiap tahun satu blok (label kolom dari `data-label`), tanpa geser samping.
 */
export function DinamikaRiwayat({ rows, tahunAktif }: { rows: readonly DinamikaRow[]; tahunAktif: number }) {
  return (
    <details className={s.riwayat}>
      <summary className={s.summary}>
        <span>{T.riwayat(rows.length)}</span>
        <IconChevronDown size={18} stroke={2} className={s.chevron} aria-hidden />
      </summary>
      <p className={s.riwayatCaption}>{T.riwayatCaption}</p>
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">{T.tahun}</th>
            {KOLOM.map((k) => (
              <th key={k.key} scope="col" className={s.num}>
                {k.label}
              </th>
            ))}
            <th scope="col" className={s.num}>
              {T.bersih}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={row.tahun === tahunAktif ? s.aktif : undefined}>
              <th scope="row" className={s.tahun}>
                {row.tahun}
              </th>
              {KOLOM.map((k) => (
                <td key={k.key} className={s.num} data-label={k.label}>
                  {formatJumlah(row[k.key])}
                </td>
              ))}
              <td className={`${s.num} ${s.bersih}`} data-label={T.bersih}>
                {formatSelisih(dinamikaNeraca(row).bersih)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
