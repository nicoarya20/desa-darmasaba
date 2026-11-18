'use client';
import detail from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import { Image } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import BackButton from '../../../../pemerintahan/layanan/_com/BackButto';
import page from '../../../../pemerintahan/layanan/_com/layanan.module.css';
import { KontakActions } from '@/app/(public)/_com/kontak-darurat/KontakActions';
import list from '@/app/(public)/_com/kontak-darurat/kontak-darurat.module.css';
import { phoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import type { KontakDarurat } from '../kontak-darurat.logic';
import { KONTAK_LIST_HREF } from '../kontak-darurat.meta';
import { KONTAK_TEXT as T } from '../kontak-darurat.text';
import { useKontakDaruratDetail, type KontakDetailState } from '../use-kontak-darurat';
import s from './kontak-detail.module.css';

/** Halaman detail satu kontak darurat kesehatan. */
export function KontakDaruratDetail({ id }: { id: string }) {
  const { state, retry } = useKontakDaruratDetail(id);
  return <KontakDaruratDetailView state={state} onRetry={retry} />;
}

/** Tampilan detail untuk satu keadaan muat (dipisah dari hook agar bisa dirender di test). */
export function KontakDaruratDetailView({ state, onRetry }: { state: KontakDetailState; onRetry: () => void }) {
  return (
    <div className={page.page}>
      <article className={detail.wrap} aria-busy={state.status === 'loading' || undefined}>
        <BackButton />
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <KontakDetailBody data={state.data} /> : null}
        {state.status === 'notfound' ? (
          <div className={page.empty}>
            <p className={detail.emptyText}>{T.notFound}</p>
            <Link href={KONTAK_LIST_HREF} className={`${detail.emptyLink} ${r.trigger}`}>
              <span className={r.cta} data-text={T.backToList}>
                {T.backToList}
              </span>
              <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
        {state.status === 'error' ? (
          <div className={page.empty} role="alert">
            <p className={list.stateText}>{T.detailError}</p>
            <button type="button" className={list.retry} onClick={onRetry}>
              {T.retry}
            </button>
          </div>
        ) : null}
      </article>
    </div>
  );
}

/** Isi detail: kategori (tautan ke daftar), nama, panel nomor + tombol, deskripsi, foto (bila ada). */
export function KontakDetailBody({ data }: { data: KontakDarurat }) {
  const photo = data.image?.link;
  return (
    <>
      <header className={detail.head}>
        <Link href={KONTAK_LIST_HREF} className={`${detail.kategori} ${r.trigger}`}>
          <span className={r.cta} data-text={T.title}>
            {T.title}
          </span>
        </Link>
        <h1 className={detail.title}>{data.name}</h1>
      </header>

      <section className={s.callPanel} aria-label={T.callPanelLabel}>
        <KontakActions name={data.name} phone={phoneInfo(data.whatsapp)} variant="detail" />
      </section>

      {/* Deskripsi dari editor admin (HTML tepercaya), sama seperti halaman sebelumnya. */}
      {data.deskripsi ? (
        <div className={`${detail.content} ${rt.root}`} dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
      ) : null}

      {photo ? (
        <figure className={s.figure}>
          <Image src={photo} alt={T.photoAlt(data.name)} className={s.figureImg} />
        </figure>
      ) : null}
    </>
  );
}

function DetailPlaceholder() {
  return (
    <div className={detail.placeholder} aria-label={T.loading}>
      <span className={`${detail.bar} ${detail.barMeta}`} />
      <span className={`${detail.bar} ${detail.barTitle}`} />
      <span className={`${detail.bar} ${detail.barFigure}`} />
    </div>
  );
}
