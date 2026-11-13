import { formatTanggalKabar } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { PencegahanItem } from './pencegahan.logic';
import s from './pencegahan.module.css';
import { PENCEGAHAN_TEXT as T } from './pencegahan.text';
import { VideoFacade } from './VideoFacade';

/**
 * Sorotan = program terbaru, pola kartu utama Kabar Desa (video kiri 3/5, teks kanan 2/5). Tanpa video YouTube yang
 * valid → panel teks saja (tanpa iframe/pratinjau kosong).
 */
export function PencegahanSorotan({ item }: { item: PencegahanItem }) {
  return (
    <article className={item.videoId ? s.sorotan : `${s.sorotan} ${s.sorotanPlain}`} aria-labelledby={`sorotan-${item.id}`}>
      {item.videoId ? <VideoFacade videoId={item.videoId} title={item.title} /> : null}
      <div className={s.sorotanBody}>
        <p className={kabar.meta}>
          <span className={kabar.kategori}>{T.sorotan}</span>
          <time dateTime={new Date(item.createdAt).toISOString()}>{formatTanggalKabar(item.createdAt)}</time>
        </p>
        <h2 id={`sorotan-${item.id}`} className={s.sorotanTitle}>
          <Link href={item.href}>{item.title}</Link>
        </h2>
        {item.summary ? <p className={s.sorotanSummary}>{item.summary}</p> : null}
        {/* Tautan kedua ke tujuan yang sama: penanda visual saja, dilewati pembaca layar & Tab (judul sudah tautan). */}
        <Link href={item.href} className={s.more} aria-hidden tabIndex={-1}>
          {T.selengkapnya}
          <IconChevronRight size={16} stroke={2} />
        </Link>
      </div>
    </article>
  );
}
