'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { Suspense } from 'react';
import { LOWONGAN_BRAND_VARS } from './_com/lowongan-filter.meta';
import { LOWONGAN_FILTER_TEXT as T } from './_com/lowongan-filter.text';
import s from './_com/lowongan-layout.module.css';
import { LowonganBody } from './_com/LowonganBody';
import { useLowonganData } from './_com/use-lowongan-data';
import { useLowonganParams } from './_com/use-lowongan-params';

/**
 * Daftar lowongan kerja publik (`/ekonomi/lowongan-kerja-lokal`): kepala + cari (`?q=`), panel Filter kiri (drawer di
 * ≤1068px), baris alat, dan daftar kartu. Data dimuat sekali lalu disaring di klien (lihat lowongan-filter.meta.ts).
 */
function LowonganPage() {
  const { params, update } = useLowonganParams();
  const { state, retry } = useLowonganData();

  return (
    <div className={s.page} style={LOWONGAN_BRAND_VARS}>
      <div className={s.inner}>
        <KabarListHeader
          title={T.title}
          lead={T.lead}
          searchLabel={T.searchLabel}
          searchPlaceholder={T.searchPlaceholder}
          kategoriLabel={T.kategoriLabel}
          tabs={[]}
          search={params.q}
          onSearch={(q) => update((current) => ({ ...current, q }))}
        />
        <LowonganBody state={state} params={params} update={update} onRetry={retry} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LowonganPage />
    </Suspense>
  );
}
