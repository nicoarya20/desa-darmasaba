'use client';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import { IconBriefcase, IconUserSearch } from '@tabler/icons-react';
import { useId, useState } from 'react';
import l from '../lowongan-layout.module.css';
import { LOWONGAN_BRAND_VARS } from '../lowongan-filter.meta';
import { DetailHeader } from './DetailHeader';
import { DetailSection } from './DetailSection';
import { DetailStatus } from './DetailStatus';
import { DetailTempatKerja } from './DetailTempatKerja';
import { KontakAksi } from './KontakAksi';
import { KontakBar } from './KontakBar';
import s from './lowongan-detail.module.css';
import { LOWONGAN_DETAIL_TEXT as T } from './lowongan-detail.text';
import type { LowonganDetail as Detail } from './lowongan-detail.types';
import { useLowonganDetail } from './use-lowongan-detail';

/**
 * Halaman detail lowongan kerja publik gaya Welcome to the Jungle: tombol kembali, satu kartu putih (kepala + aksi
 * kontak, Deskripsi pekerjaan, Kualifikasi, Tempat kerja, penutup) dan bilah kontak melayang. Data dari
 * `useLowonganDetail`, bukan state admin.
 */
export function LowonganDetail({ id }: { id: string }) {
  const { state, reload } = useLowonganDetail(id);

  return (
    <div className={l.page} style={LOWONGAN_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={s.inner}>
        <div className={s.back}>
          <BackButton />
        </div>
        {state.status === 'ready' ? (
          <LowonganDetailBody data={state.data} />
        ) : (
          <DetailStatus status={state.status} onRetry={reload} />
        )}
      </div>
    </div>
  );
}

/** Kartu detail yang sudah dimuat + bilah melayang (diekspor untuk test). */
export function LowonganDetailBody({ data }: { data: Detail }) {
  // Elemen aksi kepala & penutup lewat callback ref (state, bukan useRef) supaya KontakBar memasang observer saat terpasang.
  const [aksiKepala, setAksiKepala] = useState<HTMLDivElement | null>(null);
  const [aksiPenutup, setAksiPenutup] = useState<HTMLDivElement | null>(null);
  const penutupId = useId();

  return (
    <>
      <article className={s.card}>
        <DetailHeader data={data} aksiRef={setAksiKepala} />
        {data.deskripsi && <DetailSection title={T.deskripsi} icon={IconBriefcase} body={data.deskripsi} />}
        {data.kualifikasi && <DetailSection title={T.kualifikasi} icon={IconUserSearch} body={data.kualifikasi} />}
        <DetailTempatKerja data={data} />
        {data.kontak && (
          <aside className={s.penutup} aria-labelledby={penutupId}>
            <div className={s.penutupText}>
              <h2 id={penutupId} className={s.penutupTitle}>
                {T.penutupJudul}
              </h2>
              <p className={s.penutupAjak}>{T.penutupAjak(data.pemberiKerja, data.kontak.waHref !== null)}</p>
              <p className={s.penutupCatatan}>{T.penutupCatatan}</p>
            </div>
            <KontakAksi ref={setAksiPenutup} kontak={data.kontak} variant="inline" />
          </aside>
        )}
      </article>
      {data.kontak && <KontakBar posisi={data.posisi} kontak={data.kontak} kepala={aksiKepala} penutup={aksiPenutup} />}
    </>
  );
}
