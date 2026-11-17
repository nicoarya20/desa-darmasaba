import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { Image } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { KesejahteraanItem } from './kesejahteraan.logic';
import s from './kesejahteraan.module.css';
import { KESEJAHTERAAN_TEXT as T } from './kesejahteraan.text';

/**
 * Sorotan = program terbaru; seluruh ubin = tautan detail. Berfoto → kartu utama Kabar Desa (foto 3/5, teks 2/5).
 * Tanpa foto → ubin teks saja selebar baca 860px (tanpa ruang foto kosong / gambar pengganti).
 */
export function KesejahteraanSorotan({ item }: { item: KesejahteraanItem }) {
  const text = (
    <>
      <span className={kabar.meta}>
        <span className={s.label}>{T.sorotan}</span>
      </span>
      <h2 className={kabar.featuredTitle}>
        <span className={r.title}>{item.title}</span>
      </h2>
      {item.summary ? <span className={kabar.featuredSummary}>{item.summary}</span> : null}
      <span className={s.more} aria-hidden>
        {T.selengkapnya}
        <IconChevronRight size={16} stroke={2} />
      </span>
    </>
  );

  if (!item.imageUrl) {
    return (
      <Link href={item.href} className={s.plain}>
        <span className={s.plainBody}>{text}</span>
      </Link>
    );
  }
  return (
    <Link href={item.href} className={`${kabar.featured} ${r.trigger}`}>
      <span className={kabar.featuredPhoto}>
        <Image src={item.imageUrl} alt="" className={kabar.photoImg} decoding="async" />
      </span>
      <span className={kabar.featuredBody}>{text}</span>
    </Link>
  );
}
