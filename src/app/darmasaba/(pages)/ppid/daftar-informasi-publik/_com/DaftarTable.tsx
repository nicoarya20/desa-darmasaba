import { htmlToPlainText } from '@/app/darmasaba/(pages)/pemerintahan/potensi/_com/potensi.logic';
import { Skeleton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { daftarDetailHref, formatTanggal, rowNumber, type InformasiItem } from './daftar.logic';
import s from './daftar.module.css';
import { DAFTAR_TEXT } from './daftar.text';

const COL = DAFTAR_TEXT.columns;

type Props = {
  items: readonly InformasiItem[];
  page: number;
  /** Sedang memuat halaman/pencarian berikutnya: baris lama diredupkan, tidak diganti kerangka. */
  busy?: boolean;
};

/**
 * Daftar informasi publik: tabel di kartu putih (desktop), tiap baris jadi kartu bertumpuk di mobile.
 * Jenis informasi dan deskripsi ditampilkan utuh, tanpa dipotong.
 */
export function DaftarTable({ items, page, busy = false }: Props) {
  return (
    <div className={s.tableCard} aria-busy={busy} data-busy={busy || undefined}>
      <table className={s.table}>
        <caption className={s.srOnly}>{DAFTAR_TEXT.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col" className={s.colNo}>{COL.no}</th>
            <th scope="col" className={s.colJenis}>{COL.jenis}</th>
            <th scope="col">{COL.deskripsi}</th>
            <th scope="col" className={s.colTanggal}>{COL.tanggal}</th>
            <th scope="col" className={s.colAksi}>{COL.aksi}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className={s.no}>{rowNumber(page, index)}</td>
              <th scope="row" className={s.jenis}>{item.jenisInformasi}</th>
              {/* Deskripsi berasal dari editor admin (HTML): di daftar ditampilkan sebagai teks polos. */}
              <td className={s.deskripsi}>{htmlToPlainText(item.deskripsi) || DAFTAR_TEXT.emptyValue}</td>
              <td className={s.tanggal}>{formatTanggal(item.tanggal, DAFTAR_TEXT.emptyValue)}</td>
              <td className={s.aksi}>
                <Link
                  href={daftarDetailHref(item.id)}
                  className={s.detailLink}
                  aria-label={DAFTAR_TEXT.detailLabel(item.jenisInformasi)}
                >
                  {DAFTAR_TEXT.detail}
                  <IconChevronRight size={16} stroke={2} aria-hidden />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Kerangka daftar selama data pertama dimuat. */
export function DaftarTableSkeleton() {
  return (
    <div className={s.skeleton} role="status" aria-label={DAFTAR_TEXT.loading}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} h={88} radius={18} />
      ))}
    </div>
  );
}
