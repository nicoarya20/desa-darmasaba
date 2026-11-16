'use client';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { kategoriSlug, SEMUA_SLUG } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { isKegiatanPembangunan } from '@/lib/kegiatan-pembangunan';
import { formatTanggalTerbit } from '@/lib/tanggal-terbit';
import { Image } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconMapPin, IconUsers } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import BackButton from '../../../layanan/_com/BackButto';
import { kegiatanListHref } from '../kegiatan-list.logic';
import PembangunanInfo from '../PembangunanInfo';
import type { KegiatanDetail as Detail } from './kegiatan-detail.source';
import s from './kegiatan-detail.module.css';
import { KEGIATAN_DETAIL_TEXT as T } from './kegiatan-detail.text';
import { useKegiatanDetail } from './use-kegiatan-detail';

/** Daftar pemakai lain dari tabel kegiatan yang sama (mis. Gotong Royong): nama tautan kembali + URL daftarnya. */
export type KegiatanDetailList = { label: string; href: string };

/**
 * Halaman detail kegiatan: kategori · tanggal, judul, ringkasan, lokasi & partisipan, foto, progres pembangunan, isi.
 * `list` (opsional) → tautan teks "‹ {label}" ke `href` menggantikan tombol ikon kembali, tautan "Lihat semua" menuju
 * `href`, dan kategori tidak menaut ke daftar Kegiatan Desa. Tanpa `list` = tampilan Kegiatan Desa.
 */
export function KegiatanDetail({ id, list }: { id: string; list?: KegiatanDetailList }) {
  const state = useKegiatanDetail(id);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        {list ? (
          <Link href={list.href} className={back.back}>
            <IconChevronLeft size={16} stroke={2} aria-hidden />
            {list.label}
          </Link>
        ) : (
          <BackButton />
        )}
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <KegiatanDetailBody data={state.data} linkKategori={!list} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={list?.href ?? kegiatanListHref(SEMUA_SLUG)} className={d.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Isi detail kegiatan yang sudah dimuat (diekspor untuk test); `linkKategori` false → kategori teks biasa. */
export function KegiatanDetailBody({ data, linkKategori = true }: { data: Detail; linkKategori?: boolean }) {
  const kategori = data.kategoriKegiatan?.nama?.trim();
  const tanggal = new Date(data.tanggal);
  const lokasi = data.lokasi?.trim();
  const ringkasan = data.deskripsiSingkat?.trim();

  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          {kategori && linkKategori ? (
            <Link href={kegiatanListHref(kategoriSlug(kategori))} className={d.kategori}>
              {kategori}
            </Link>
          ) : null}
          {kategori && !linkKategori ? <span className={d.kategori}>{kategori}</span> : null}
          <time dateTime={tanggal.toISOString()}>{formatTanggalTerbit(tanggal)}</time>
        </p>
        <h1 className={d.title}>{data.judul}</h1>
        {ringkasan ? <p className={s.lead}>{ringkasan}</p> : null}
        <ul className={s.facts} aria-label={T.infoLabel}>
          {lokasi ? (
            <li className={s.fact}>
              <IconMapPin className={s.factIcon} size={18} stroke={1.75} aria-hidden />
              <span>{lokasi}</span>
            </li>
          ) : null}
          <li className={s.fact}>
            <IconUsers className={s.factIcon} size={18} stroke={1.75} aria-hidden />
            <span>{T.partisipan(data.partisipan ?? 0)}</span>
          </li>
        </ul>
      </header>

      {data.image?.link ? (
        <figure className={d.photo}>
          <a href={data.image.link} target="_blank" rel="noopener noreferrer" aria-label={T.fotoLabel}>
            <Image src={data.image.link} alt={data.judul} className={d.photoImg} />
          </a>
        </figure>
      ) : null}

      {isKegiatanPembangunan(data) ? (
        <section className={s.block} aria-label={T.pembangunan} data-kegiatan-pembangunan>
          <h2 className={s.blockTitle}>{T.pembangunan}</h2>
          <div className={s.panel}>
            <PembangunanInfo item={data} showSumberDana />
          </div>
        </section>
      ) : null}

      {/* Isi dari editor admin (HTML tepercaya), sama seperti halaman sebelumnya. */}
      {data.deskripsiLengkap ? (
        <div className={d.content} dangerouslySetInnerHTML={{ __html: data.deskripsiLengkap }} />
      ) : null}
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
