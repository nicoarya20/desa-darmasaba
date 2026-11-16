'use client';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import { KabarDetailPlaceholder } from '@/app/(public)/_com/kabar-list/KabarDetailPlaceholder';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { useKabarDetail } from '@/app/(public)/_com/kabar-list/use-kabar-detail';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { inovasiKategoriLabel, isInovasiKategori } from '@/lib/inovasi-teknologi/kategori';
import { formatTanggalTerbit } from '@/lib/tanggal-terbit';
import { Image } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { inovasiListHref, type InovasiApiItem } from '../inovasi.logic';
import { loadInovasiDetail } from '../inovasi.source';
import { INOVASI_DETAIL_TEXT as T } from '../inovasi.text';

/** Halaman detail Inovasi Teknologi Desa: kembali, kategori + tanggal, judul, foto, lalu isi. */
export function InovasiDetail({ id }: { id: string }) {
  const state = useKabarDetail(id, loadInovasiDetail, 'inovasi teknologi desa');

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <BackButton />
        {state.status === 'loading' ? <KabarDetailPlaceholder label={T.loading} /> : null}
        {state.status === 'ready' ? <InovasiDetailBody data={state.data} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={inovasiListHref()} className={d.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Isi detail yang sudah dimuat (diekspor untuk test); pil kategori menuju daftar tersaring kategori itu. */
export function InovasiDetailBody({ data }: { data: InovasiApiItem }) {
  const dibuat = new Date(data.createdAt);
  const label = inovasiKategoriLabel(data.kategori);

  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          {label && isInovasiKategori(data.kategori) ? (
            <Link href={inovasiListHref({ kategori: data.kategori })} className={d.kategori}>
              {label}
            </Link>
          ) : null}
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

      {/* Isi dari editor admin (HTML tepercaya), sama seperti halaman Desa Digital sebelumnya. */}
      {data.deskripsi ? <div className={d.content} dangerouslySetInnerHTML={{ __html: data.deskripsi }} /> : null}
    </>
  );
}
