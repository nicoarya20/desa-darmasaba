import { Image } from '@mantine/core';
import { formatTanggalKabar, type KabarItem } from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.logic';
import { IconChevronRight, IconFileText } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import s from './pengumuman-list.module.css';

function Thumb({ url }: { url?: string }) {
  if (!url) {
    return (
      <span className={`${s.thumb} ${s.thumbFallback}`} aria-hidden>
        <IconFileText size={28} stroke={1.5} />
      </span>
    );
  }
  // Dekoratif (alt kosong): judul baris sudah menjadi nama tautan.
  return <Image src={url} alt="" className={s.thumb} loading="lazy" decoding="async" />;
}

type Props = {
  items: readonly KabarItem[];
  loading: boolean;
  /** Jumlah baris kerangka saat memuat. */
  placeholderRows: number;
  /** Tampilkan nama kategori di atas judul (dimatikan saat daftar sudah disaring satu kategori). */
  showKategori: boolean;
  loadingLabel: string;
};

/** Baris pengumuman dalam panel #f5f5f7: thumbnail · kategori + judul · tanggal · chevron; tiap baris = tautan detail. */
export function PengumumanRows({ items, loading, placeholderRows, showKategori, loadingLabel }: Props) {
  if (loading) {
    return (
      <ul className={s.panel} aria-busy="true" aria-label={loadingLabel}>
        {Array.from({ length: placeholderRows }, (_, i) => (
          <li key={i} className={s.rowPlaceholder} aria-hidden>
            <span className={s.thumb} />
            <span className={s.barGroup}>
              <span className={s.bar} />
              <span className={`${s.bar} ${s.barShort}`} />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={s.panel}>
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className={s.row}>
            <Thumb url={item.imageUrl} />
            <span className={s.body}>
              {showKategori && item.kategori ? <span className={s.kategori}>{item.kategori}</span> : null}
              <span className={s.title}>{item.title}</span>
            </span>
            <time className={s.date} dateTime={new Date(item.createdAt).toISOString()}>
              {formatTanggalKabar(item.createdAt)}
            </time>
            <IconChevronRight className={s.chevron} size={18} stroke={1.75} aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
