import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { DesaDigitalPhoto } from './DesaDigitalCards';
import type { DesaDigitalItem } from './desa-digital.logic';
import s from './desa-digital.module.css';
import { DESA_DIGITAL_TEXT as T } from './desa-digital.text';

/** Sorotan = layanan terbaru, pola kartu utama Kabar Desa (foto kiri 3/5, teks kanan 2/5); seluruh ubin = tautan detail. */
export function DesaDigitalSorotan({ item }: { item: DesaDigitalItem }) {
  return (
    <Link href={item.href} className={kabar.featured}>
      <span className={kabar.featuredPhoto}>
        <DesaDigitalPhoto url={item.imageUrl} />
      </span>
      <span className={kabar.featuredBody}>
        <span className={kabar.meta}>
          <span className={s.label}>{T.sorotan}</span>
        </span>
        <h2 className={kabar.featuredTitle}>{item.title}</h2>
        {item.summary ? <span className={kabar.featuredSummary}>{item.summary}</span> : null}
        <span className={s.more} aria-hidden>
          {T.selengkapnya}
          <IconChevronRight size={16} stroke={2} />
        </span>
      </span>
    </Link>
  );
}
