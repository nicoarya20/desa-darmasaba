'use client';
import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { programKreatifListHref, type ProgramKreatifApiItem } from '../program-kreatif.logic';
import { PROGRAM_KREATIF_DETAIL_TEXT as T } from '../program-kreatif.text';
import s from './program-kreatif-detail.module.css';
import { useProgramKreatifDetail } from './use-program-kreatif-detail';

/** Halaman detail program kreatif: "‹ Program Kreatif Desa", kategori, judul, deskripsi singkat, lalu isi. */
export function ProgramKreatifDetail({ id }: { id: string }) {
  const state = useProgramKreatifDetail(id);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <Link href={programKreatifListHref()} className={back.back}>
          <IconChevronLeft size={16} stroke={2} aria-hidden />
          {T.kembali}
        </Link>
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <ProgramKreatifDetailBody data={state.data} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={programKreatifListHref()} className={d.emptyLink}>
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
export function ProgramKreatifDetailBody({ data }: { data: ProgramKreatifApiItem }) {
  const ringkasan = data.slug?.trim();

  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          <span className={d.kategori}>{T.kategori}</span>
        </p>
        <h1 className={d.title}>{data.name}</h1>
        {ringkasan ? <p className={s.lead}>{ringkasan}</p> : null}
      </header>

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
    </div>
  );
}
