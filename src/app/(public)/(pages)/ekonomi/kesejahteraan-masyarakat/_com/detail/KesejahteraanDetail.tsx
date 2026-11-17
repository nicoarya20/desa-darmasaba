'use client';
import { VideoFacade } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/VideoFacade';
import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import { DokumentasiGaleri } from '@/app/(public)/(tambahan)/program-inovasi/[id]/_com/DokumentasiGaleri';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { Image } from '@mantine/core';
import { IconArrowUpRight, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { useMemo } from 'react';
import { kesejahteraanListHref, toKesejahteraanDetail, type KesejahteraanDetail as Detail } from '../kesejahteraan.logic';
import { KESEJAHTERAAN_DETAIL_TEXT as T } from '../kesejahteraan.text';
import s from './kesejahteraan-detail.module.css';
import { useKesejahteraanDetail } from './use-kesejahteraan-detail';

/** Halaman detail program: "‹ Kesejahteraan Masyarakat", kategori, judul, pengantar, foto, video, isi, galeri. */
export function KesejahteraanDetail({ id }: { id: string }) {
  const state = useKesejahteraanDetail(id);
  const data = state.status === 'ready' ? state.data : null;
  // Sanitasi (DOMPurify) cukup sekali per data, bukan tiap render.
  const detail = useMemo(() => (data ? toKesejahteraanDetail(data) : null), [data]);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <Link href={kesejahteraanListHref()} className={`${back.back} ${r.trigger}`}>
          <IconChevronLeft className={r.chevronBack} size={16} stroke={2} aria-hidden />
          <span className={r.cta} data-text={T.kembali}>
            {T.kembali}
          </span>
        </Link>
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {detail ? <KesejahteraanDetailBody detail={detail} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={kesejahteraanListHref()} className={`${d.emptyLink} ${r.trigger}`}>
              <span className={r.cta} data-text={T.backToList}>
                {T.backToList}
              </span>
              <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Isi detail yang sudah disiapkan `toKesejahteraanDetail` (diekspor untuk test). Tanpa tanggal (createdAt = tanggal
 * input admin). HTML sudah disanitasi; video hanya lewat fasad YouTube atau tautan tab baru. Bagian kosong tidak dirender.
 */
export function KesejahteraanDetailBody({ detail }: { detail: Detail }) {
  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          <Link href={kesejahteraanListHref()} className={`${d.kategori} ${r.trigger}`}>
            <span className={r.cta} data-text={T.kategori}>
              {T.kategori}
            </span>
          </Link>
        </p>
        <h1 className={d.title}>{detail.title}</h1>
        {detail.leadHtml ? <div className={s.lead} dangerouslySetInnerHTML={{ __html: detail.leadHtml }} /> : null}
      </header>

      {detail.imageUrl ? (
        <figure className={d.photo}>
          <a href={detail.imageUrl} target="_blank" rel="noopener noreferrer" aria-label={T.fotoLabel}>
            <Image src={detail.imageUrl} alt={detail.title} className={d.photoImg} />
          </a>
        </figure>
      ) : null}

      {detail.videoId ? <VideoFacade videoId={detail.videoId} title={detail.title} /> : null}
      {detail.videoHref ? (
        <a href={detail.videoHref} target="_blank" rel="noopener noreferrer" className={`${s.videoLink} ${r.trigger}`}>
          <span className={r.cta} data-text={T.bukaVideo}>
            {T.bukaVideo}
          </span>
          <IconArrowUpRight size={16} stroke={2} aria-hidden />
        </a>
      ) : null}

      {detail.html ? <div className={d.content} dangerouslySetInnerHTML={{ __html: detail.html }} /> : null}

      {detail.galeri.length > 0 ? (
        <section className={s.block} aria-label={T.galeri}>
          <h2 className={s.blockTitle}>{T.galeri}</h2>
          <DokumentasiGaleri images={detail.galeri} judul={null} alt={T.galeriAlt} />
        </section>
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
