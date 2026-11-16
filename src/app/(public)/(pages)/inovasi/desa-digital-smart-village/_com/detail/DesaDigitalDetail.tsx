'use client';
import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { Image } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { desaDigitalListHref, type DesaDigitalApiItem } from '../desa-digital.logic';
import { DESA_DIGITAL_DETAIL_TEXT as T } from '../desa-digital.text';
import { useDesaDigitalDetail } from './use-desa-digital-detail';

/** Halaman detail layanan desa digital: "‹ Desa Digital / Smart Village", kategori, judul, foto, lalu isi. */
export function DesaDigitalDetail({ id }: { id: string }) {
  const state = useDesaDigitalDetail(id);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <Link href={desaDigitalListHref()} className={back.back}>
          <IconChevronLeft size={16} stroke={2} aria-hidden />
          {T.kembali}
        </Link>
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <DesaDigitalDetailBody data={state.data} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={desaDigitalListHref()} className={d.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Isi detail yang sudah dimuat (diekspor untuk test). Tanpa tanggal (createdAt = tanggal input admin); bagian kosong tidak dirender. */
export function DesaDigitalDetailBody({ data }: { data: DesaDigitalApiItem }) {
  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          <span className={d.kategori}>{T.kategori}</span>
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
      {data.deskripsi ? <div className={d.content} dangerouslySetInnerHTML={{ __html: data.deskripsi }} /> : null}
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
