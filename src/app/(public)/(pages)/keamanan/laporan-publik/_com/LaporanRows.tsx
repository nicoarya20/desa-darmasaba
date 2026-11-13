import { IconChevronRight, IconMapPin } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { formatTanggalWaktu, laporanDetailHref, type LaporanPublik } from './laporan.logic';
import s from './laporan.module.css';
import { LAPORAN_TEXT as T } from './laporan.text';
import { LaporanStatus } from './LaporanStatus';

type Props = {
  items: readonly LaporanPublik[];
  loading: boolean;
  /** Jumlah baris kerangka saat memuat. */
  placeholderRows: number;
};

/** Baris laporan dalam panel #f5f5f7: judul + lokasi · waktu kejadian, status (teks + warna), chevron; tiap baris = tautan detail. */
export function LaporanRows({ items, loading, placeholderRows }: Props) {
  if (loading) {
    return (
      <ul className={s.panel} aria-busy="true" aria-label={T.loading}>
        {Array.from({ length: placeholderRows }, (_, i) => (
          <li key={i} className={s.rowPlaceholder} aria-hidden>
            <span className={s.bar} />
            <span className={`${s.bar} ${s.barShort}`} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={s.panel} aria-label={T.listLabel}>
      {items.map((item) => {
        const waktu = formatTanggalWaktu(item.tanggalWaktu);
        const lokasi = item.lokasi?.trim();
        return (
          <li key={item.id}>
            <Link href={laporanDetailHref(item.id)} className={s.row}>
              <span className={s.body}>
                <span className={s.title}>{item.judul}</span>
                <span className={s.meta}>
                  <span className={s.lokasi}>
                    <IconMapPin size={15} stroke={1.75} aria-hidden />
                    {lokasi || T.noLokasi}
                  </span>
                  {waktu ? <time dateTime={item.tanggalWaktu}>{waktu}</time> : null}
                </span>
              </span>
              <LaporanStatus status={item.status} className={s.status} />
              <IconChevronRight className={s.chevron} size={18} stroke={1.75} aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
