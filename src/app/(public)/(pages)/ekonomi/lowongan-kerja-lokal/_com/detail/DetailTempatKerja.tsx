import { IconExternalLink, IconPhone } from '@tabler/icons-react';
import s from './detail-section.module.css';
import { LOWONGAN_DETAIL_TEXT as T } from './lowongan-detail.text';
import type { LowonganDetail } from './lowongan-detail.types';

type Props = { data: Pick<LowonganDetail, 'pemberiKerja' | 'lokasi' | 'petaHref' | 'kontak'> };

/** "Tempat kerja": pemberi kerja, alamat lengkap + tautan Google Maps (tab baru), nomor kontak tampilan. Semua kosong → tidak dirender. */
export function DetailTempatKerja({ data }: Props) {
  if (!data.pemberiKerja && !data.lokasi && !data.kontak) return null;

  return (
    <section className={s.section}>
      <h2 className={s.placeTitle}>{T.tempatKerja}</h2>
      <div className={s.place}>
        {data.pemberiKerja && <p className={s.placeName}>{data.pemberiKerja}</p>}
        {data.lokasi && <p className={s.placeText}>{data.lokasi}</p>}
        {data.petaHref && (
          <a className={s.placeLink} href={data.petaHref} target="_blank" rel="noopener noreferrer">
            {T.bukaPeta}
            <IconExternalLink size={16} stroke={1.75} aria-hidden="true" />
            <span className={s.srOnly}> {T.tabBaru}</span>
          </a>
        )}
        {data.kontak && (
          <p className={s.placePhone}>
            <IconPhone size={16} stroke={1.75} aria-hidden="true" />
            {data.kontak.display}
          </p>
        )}
      </div>
    </section>
  );
}
