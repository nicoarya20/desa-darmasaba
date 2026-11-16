'use client';
import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { penghijauanListHref, toPenghijauanDetail, type PenghijauanDetail } from '../penghijauan.logic';
import { PENGHIJAUAN_DETAIL_TEXT as T } from '../penghijauan.text';
import s from './penghijauan-detail.module.css';
import { usePenghijauanDetail } from './use-penghijauan-detail';

/** Halaman detail program penghijauan: "‹ Program Penghijauan", kategori, judul, pengantar, lalu isi (rata kiri). */
export function PenghijauanDetailView({ id }: { id: string }) {
  const state = usePenghijauanDetail(id);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <Link href={penghijauanListHref()} className={back.back}>
          <IconChevronLeft size={16} stroke={2} aria-hidden />
          {T.kembali}
        </Link>
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <PenghijauanDetailBody detail={toPenghijauanDetail(state.data)} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={penghijauanListHref()} className={d.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Isi detail yang sudah dimuat (diekspor untuk test). Tanpa label gaya form admin; bagian kosong tidak dirender. */
export function PenghijauanDetailBody({ detail }: { detail: PenghijauanDetail }) {
  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          <span className={d.kategori}>{T.kategori}</span>
        </p>
        <h1 className={d.title}>{detail.title}</h1>
        {detail.lead ? <p className={s.lead}>{detail.lead}</p> : null}
      </header>

      {/* HTML editor admin, sudah disaring sanitizeRichText di toPenghijauanDetail. */}
      {detail.html ? <div className={d.content} dangerouslySetInnerHTML={{ __html: detail.html }} /> : null}
    </>
  );
}

function DetailPlaceholder() {
  return (
    <div className={d.placeholder} aria-label={T.loading}>
      <span className={`${d.bar} ${d.barMeta}`} />
      <span className={`${d.bar} ${d.barTitle}`} />
      <span className={`${d.bar} ${d.barTitleShort}`} />
    </div>
  );
}
