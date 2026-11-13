'use client';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconCalendarEvent, IconChevronRight, IconMapPin } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import { formatTanggalWaktu, type LaporanPublik } from '../laporan.logic';
import { LAPORAN_LIST_HREF } from '../laporan.meta';
import { LaporanStatus } from '../LaporanStatus';
import s from './laporan-detail.module.css';
import { LAPORAN_DETAIL_TEXT as T } from './laporan-detail.text';
import { LaporanLinimasa } from './LaporanLinimasa';
import { useLaporanDetail, type LaporanDetailState } from './use-laporan-detail';

/** Halaman detail laporan publik: kolom 860px, kepala (kategori · status, judul), lokasi & waktu, linimasa. */
export function LaporanDetail({ id }: { id: string }) {
  const { state, retry } = useLaporanDetail(id);
  return <LaporanDetailView state={state} onRetry={retry} />;
}

/** Tampilan detail untuk satu keadaan muat (diekspor untuk test). */
export function LaporanDetailView({ state, onRetry }: { state: LaporanDetailState; onRetry: () => void }) {
  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <BackButton />
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <DetailBody data={state.data} /> : null}
        {state.status === 'notfound' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{T.notFound}</p>
            <Link href={LAPORAN_LIST_HREF} className={d.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
        {state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{T.error}</p>
            <button type="button" className={s.retry} onClick={onRetry}>
              {T.retry}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function DetailBody({ data }: { data: LaporanPublik }) {
  const waktu = formatTanggalWaktu(data.tanggalWaktu);
  const lokasi = data.lokasi?.trim();
  return (
    <>
      <header className={d.head}>
        <p className={`${d.meta} ${s.meta}`}>
          <Link href={LAPORAN_LIST_HREF} className={d.kategori}>
            {T.kategori}
          </Link>
          <LaporanStatus status={data.status} />
        </p>
        <h1 className={d.title}>{data.judul}</h1>
      </header>

      <dl className={s.facts}>
        <div className={s.fact}>
          <IconMapPin className={s.factIcon} size={22} stroke={1.75} aria-hidden />
          <dt className={s.factLabel}>{T.lokasi}</dt>
          <dd className={s.factValue}>{lokasi || T.lokasiEmpty}</dd>
        </div>
        <div className={s.fact}>
          <IconCalendarEvent className={s.factIcon} size={22} stroke={1.75} aria-hidden />
          <dt className={s.factLabel}>{T.waktu}</dt>
          <dd className={s.factValue}>{waktu ? <time dateTime={data.tanggalWaktu}>{waktu}</time> : T.waktuEmpty}</dd>
        </div>
      </dl>

      <LaporanLinimasa data={data} titleId="laporan-linimasa-title" />
    </>
  );
}

function DetailPlaceholder() {
  return (
    <div className={d.placeholder} aria-label={T.loading}>
      <span className={`${d.bar} ${d.barMeta}`} />
      <span className={`${d.bar} ${d.barTitle}`} />
      <span className={`${d.bar} ${d.barTitleShort}`} />
      <span className={`${d.bar} ${s.barFacts}`} />
    </div>
  );
}
