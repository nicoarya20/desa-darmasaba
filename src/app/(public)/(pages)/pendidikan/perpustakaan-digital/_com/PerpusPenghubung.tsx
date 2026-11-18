'use client';
import frame from '../../_com/page-frame/page-frame.module.css';
import s from './perpus-page.module.css';
import type { PerpusWebsiteState } from './perpus-website.logic';
import { PerpusFitur, PerpusLangkah } from './PerpusBagian';
import { PerpusHero } from './PerpusHero';
import { PerpusPenutup } from './PerpusPenutup';
import { usePerpusWebsite } from './use-perpus-website';

/** Isi halaman tanpa efek muat (dipakai `PerpusPenghubung` dan test markup). Penutup hanya bila tautan tersedia. */
export function PerpusPenghubungBody({ state }: { state: PerpusWebsiteState }) {
  const href = state.status === 'ready' ? state.data?.websiteUrl : undefined;
  return (
    <div className={`${frame.frame} ${s.page}`}>
      <div className={`${frame.inner} ${s.inner}`}>
        <PerpusHero state={state} />
        <PerpusFitur />
        <PerpusLangkah />
        {href ? <PerpusPenutup href={href} /> : null}
      </div>
    </div>
  );
}

/** Halaman penghubung ke website perpustakaan desa: kepala, fitur, cara membaca, dan penutup. */
export function PerpusPenghubung() {
  return <PerpusPenghubungBody state={usePerpusWebsite()} />;
}
