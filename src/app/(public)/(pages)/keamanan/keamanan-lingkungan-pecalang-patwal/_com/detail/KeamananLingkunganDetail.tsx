'use client';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { formatTanggalTerbit } from '@/lib/tanggal-terbit';
import { Image } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { hasHtmlContent, keamananLingkunganListHref, type KeamananLingkunganApiItem } from '../keamanan-lingkungan.logic';
import { KEAMANAN_LINGKUNGAN_DETAIL_TEXT as T } from '../keamanan-lingkungan.text';
import { useKeamananLingkunganDetail } from './use-keamanan-lingkungan-detail';

/** Halaman detail keamanan lingkungan: kembali, tanggal, judul, foto, lalu isi (kolom baca 860px). */
export function KeamananLingkunganDetail({ id }: { id: string }) {
  const state = useKeamananLingkunganDetail(id);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <BackButton />
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <KeamananLingkunganDetailBody data={state.data} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={keamananLingkunganListHref()} className={d.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Isi detail yang sudah dimuat (diekspor untuk test). Tanpa foto/isi → bagiannya tidak dirender (tanpa "-"). */
export function KeamananLingkunganDetailBody({ data }: { data: KeamananLingkunganApiItem }) {
  const dibuat = new Date(data.createdAt);

  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          <time dateTime={dibuat.toISOString()}>{formatTanggalTerbit(dibuat)}</time>
        </p>
        <h1 className={d.title}>{data.name}</h1>
      </header>

      {data.image?.link ? (
        <figure className={d.photo}>
          <a href={data.image.link} target="_blank" rel="noopener noreferrer" aria-label={T.fotoLabel}>
            <Image src={data.image.link} alt={data.name} className={d.photoImg} />
          </a>
        </figure>
      ) : null}

      {/* Isi dari editor admin (HTML tepercaya), sama seperti halaman sebelumnya. */}
      {hasHtmlContent(data.deskripsi) ? <div className={d.content} dangerouslySetInnerHTML={{ __html: data.deskripsi }} /> : null}
    </>
  );
}

function DetailPlaceholder() {
  return (
    <div className={d.placeholder} aria-label={T.loading}>
      <span className={`${d.bar} ${d.barMeta}`} />
      <span className={`${d.bar} ${d.barTitle}`} />
      <span className={`${d.bar} ${d.barTitleShort}`} />
      <span className={`${d.bar} ${d.barFigure}`} />
    </div>
  );
}
