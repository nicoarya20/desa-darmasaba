'use client';
import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { PengurusDetail } from '../bumdes.logic';
import { BUMDES_BASE_HREF, PENGURUS_ANCHOR } from '../bumdes.meta';
import { PENGURUS_DETAIL_TEXT as T } from '../bumdes.text';
import s from './pengurus-detail.module.css';
import { usePengurusDetail } from './use-pengurus-detail';

const LIST_HREF = `${BUMDES_BASE_HREF}#${PENGURUS_ANCHOR}`;

/** Halaman profil pengurus BUMDes: "‹ BUMDes", lalu foto/inisial, kategori, nama, jabatan. */
export function PengurusDetailView({ id }: { id: string }) {
  const state = usePengurusDetail(id);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <Link href={BUMDES_BASE_HREF} className={`${back.back} ${r.trigger}`}>
          <IconChevronLeft className={r.chevronBack} size={16} stroke={2} aria-hidden />
          <span className={r.cta} data-text={T.kembali}>
            {T.kembali}
          </span>
        </Link>
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <PengurusDetailBody detail={state.data} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={LIST_HREF} className={`${d.emptyLink} ${r.trigger}`}>
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
 * Isi profil yang sudah dimuat (diekspor untuk test): hanya nama, jabatan, foto. Email/telepon/alamat/tanggal masuk
 * sengaja tidak ditampilkan (keputusan user 2026-11-16), walau API masih mengirimnya.
 */
export function PengurusDetailBody({ detail }: { detail: PengurusDetail }) {
  return (
    <header className={s.person}>
      {detail.foto ? (
        <img src={detail.foto} alt={T.fotoAlt(detail.nama)} className={s.photo} />
      ) : (
        <span className={`${s.photo} ${s.initials}`} aria-hidden data-initials>
          {detail.initials}
        </span>
      )}
      <div className={`${d.head} ${s.text}`}>
        <p className={d.meta}>
          <span className={d.kategori}>{T.kategori}</span>
        </p>
        <h1 className={d.title}>{detail.nama}</h1>
        {detail.jabatan ? <p className={s.jabatan}>{detail.jabatan}</p> : null}
      </div>
    </header>
  );
}

function DetailPlaceholder() {
  return (
    <div className={s.person} role="status" aria-label={T.loading}>
      <span className={`${s.photo} ${kabar.placeholder} ${s.photoPlaceholder}`} aria-hidden />
      <div className={`${d.placeholder} ${s.text}`} aria-hidden>
        <span className={`${d.bar} ${d.barMeta}`} />
        <span className={`${d.bar} ${d.barTitle}`} />
        <span className={`${d.bar} ${d.barTitleShort}`} />
      </div>
    </div>
  );
}
