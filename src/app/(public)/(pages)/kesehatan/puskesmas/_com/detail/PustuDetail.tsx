'use client';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import pustuState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.state';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { PUSTU_TEXT as T } from '../pustu.text';
import PustuDetailBody from './PustuDetailBody';

/** Halaman detail PUSTU publik (kolom 860px): memuat data lalu merender isi, kerangka, atau pesan galat. */
export default function PustuDetail() {
  const id = useParams()?.id as string;
  const snap = useSnapshot(pustuState.findUnique);

  useEffect(() => {
    if (id) void pustuState.findUnique.load(id);
  }, [id]);

  const data = pustuState.findUnique.data;
  const siap = !snap.loading && data !== null && data.id === id;
  const memuat = !siap && !snap.gagal;

  return (
    <article className={kabar.section} aria-busy={memuat || undefined}>
      <div className={d.wrap}>
        <BackButton />
        {memuat ? (
          <div className={d.placeholder} aria-label={T.memuat}>
            <span className={`${d.bar} ${d.barMeta}`} />
            <span className={`${d.bar} ${d.barTitle}`} />
            <span className={`${d.bar} ${d.barFigure}`} />
          </div>
        ) : null}
        {siap && data ? <PustuDetailBody data={data} /> : null}
        {snap.gagal ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{snap.tidakDitemukan ? T.detailTidakDitemukan : T.detailGagal}</p>
            <Link href="/kesehatan/puskesmas" className={`${d.emptyLink} ${r.trigger}`}>
              <span className={r.cta} data-text={T.kembaliKeDaftar}>
                {T.kembaliKeDaftar}
              </span>
              <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
