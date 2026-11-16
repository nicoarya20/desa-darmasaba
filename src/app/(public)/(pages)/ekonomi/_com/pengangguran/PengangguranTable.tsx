import { formatPercent } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { formatJumlah } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { namaPeriode, perubahanBulan, type PengangguranBulan } from './pengangguran.logic';
import s from './pengangguran.module.css';
import { PENGANGGURAN_TEXT as T } from './pengangguran.text';

/** Persen perubahan bertanda (`+4,6%`, `−22,9%`, `0%`); `–` bila bulan sebelumnya tak tercatat atau 0. */
export function formatPerubahan(persen: number | null | undefined): string {
  if (persen === null || persen === undefined) return '–';
  if (persen === 0) return formatPercent(0);
  return `${persen > 0 ? '+' : '−'}${formatPercent(Math.abs(persen))}`;
}

type Props = { rows: readonly PengangguranBulan[]; bulan: readonly PengangguranBulan[]; tahun: number };

/**
 * Rincian per bulan satu tahun. Perubahan dihitung di klien dari bulan kalender sebelumnya (boleh lintas tahun),
 * bukan `percentageChange` tersimpan (nilainya tak konsisten 0/null, lihat BACKEND-TODO).
 */
export function PengangguranTable({ rows, bulan, tahun }: Props) {
  return (
    <table className={s.table}>
      <caption className={s.srOnly}>{T.jumlah.tableTitle(tahun)}</caption>
      <thead>
        <tr>
          <th scope="col">{T.jumlah.colBulan}</th>
          <th scope="col">{T.jumlah.colJumlah}</th>
          <th scope="col">{T.jumlah.terdidik}</th>
          <th scope="col">{T.jumlah.tidakTerdidik}</th>
          <th scope="col">{T.jumlah.colPerubahan}</th>
        </tr>
      </thead>
      <tbody>
        {bulan.map((b) => (
          <tr key={b.id}>
            <th scope="row">{namaPeriode(b)}</th>
            <td>{formatJumlah(b.total)}</td>
            <td data-label={T.jumlah.terdidik}>{formatJumlah(b.terdidik)}</td>
            <td data-label={T.jumlah.tidakTerdidik}>{formatJumlah(b.tidakTerdidik)}</td>
            <td data-label={T.jumlah.colPerubahan} className={s.change}>
              {formatPerubahan(perubahanBulan(rows, b)?.persen)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
