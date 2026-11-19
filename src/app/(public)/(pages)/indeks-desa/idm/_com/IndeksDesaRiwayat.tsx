import { DIMENSI_IDM, type IndeksDesaRecord } from '@/lib/indeks-desa';
import { barStyle, formatSkor } from './indeks-desa.logic';
import { INDEKS_DESA_TEXT as T } from './indeks-desa.text';
import s from './indeks-desa.module.css';

/**
 * Riwayat IDM per tahun (terbaru dulu): tahun, skor IDM dengan batang, status, dan skor tiga dimensi. Di ponsel tiap
 * baris menjadi blok bertumpuk berlabel (tanpa geser horizontal halaman).
 */
export function IndeksDesaRiwayat({ items }: { items: readonly IndeksDesaRecord[] }) {
  return (
    <section className={s.block} aria-labelledby="idm-riwayat-title">
      <h2 id="idm-riwayat-title" className={s.blockTitle}>{T.riwayatTitle}</h2>
      <p className={s.blockCaption}>{T.riwayatCaption}</p>
      <table className={s.table}>
        <caption className={s.srOnly}>{T.tableCaption}</caption>
        <thead className={s.thead}>
          <tr>
            <th scope="col">{T.colTahun}</th>
            <th scope="col">{T.colIdm}</th>
            <th scope="col">{T.colStatus}</th>
            {DIMENSI_IDM.map((d) => (
              <th key={d.key} scope="col" className={s.colDimensi}>{d.singkatan}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={s.row}>
              <th scope="row" className={`${s.cell} ${s.colTahun}`}>{item.tahun}</th>
              <td className={`${s.cell} ${s.colIdm}`} data-label={T.colIdm}>
                <span className={s.rowScore}>{formatSkor(item.skorIdm)}</span>
                <span className={s.rowTrack} aria-hidden>
                  <span className={s.fill} style={barStyle(item.skorIdm)} />
                </span>
              </td>
              <td className={`${s.cell} ${s.colStatus}`} data-label={T.colStatus}>{item.status}</td>
              {DIMENSI_IDM.map((d) => (
                <td key={d.key} className={`${s.cell} ${s.colDimensi}`} data-label={d.singkatan}>
                  {formatSkor(item[d.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={s.note}>{T.note}</p>
    </section>
  );
}
