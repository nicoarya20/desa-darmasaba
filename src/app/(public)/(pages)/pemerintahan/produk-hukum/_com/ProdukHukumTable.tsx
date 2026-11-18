import { labelKategoriProdukHukum, type ProdukHukumRecord } from '@/lib/produk-hukum';
import { ProdukHukumFileLinks } from './ProdukHukumFileLinks';
import { formatTahun, rowNumber } from './produk-hukum.logic';
import { PRODUK_HUKUM_TEXT as T } from './produk-hukum.text';
import s from './produk-hukum.module.css';

type Props = { items: readonly ProdukHukumRecord[]; page: number; limit: number };

/**
 * Tabel produk hukum: No, Nama (judul + nomor), Tahun, Kategori, File. Di ponsel tiap baris menjadi blok bertumpuk
 * (judul, lalu tahun dan kategori, lalu tautan file) supaya halaman tidak bergeser ke samping.
 */
export function ProdukHukumTable({ items, page, limit }: Props) {
  return (
    <table className={s.table}>
      <caption className={s.srOnly}>{T.tableCaption}</caption>
      <thead className={s.head}>
        <tr>
          <th scope="col" className={s.colNo}>{T.colNo}</th>
          <th scope="col">{T.colNama}</th>
          <th scope="col" className={s.colTahun}>{T.colTahun}</th>
          <th scope="col" className={s.colKategori}>{T.colKategori}</th>
          <th scope="col" className={s.colFile}>{T.colFile}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} className={s.row}>
            <td className={`${s.cell} ${s.colNo}`}>{rowNumber(page, limit, index)}</td>
            <td className={`${s.cell} ${s.nama}`}>
              <span className={s.judul}>{item.judul}</span>
              {item.nomor ? <span className={s.nomor}>{item.nomor}</span> : null}
            </td>
            <td className={`${s.cell} ${s.colTahun}`} data-label={T.colTahun}>{formatTahun(item.tahun)}</td>
            <td className={`${s.cell} ${s.colKategori}`}>{labelKategoriProdukHukum(item.kategori)}</td>
            <td className={`${s.cell} ${s.colFile}`}>
              <ProdukHukumFileLinks judul={item.judul} file={item.file} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
