'use client';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';
import { useId } from 'react';
import { PengaduanRekapView } from './PengaduanRekapView';
import { loadPengaduanRekap } from './rekap.source';
import s from './rekap.module.css';
import { PENGADUAN_REKAP_TEXT as T } from './rekap.text';

/** Bagian "Rekap Tindak Lanjut Pengaduan" di hub Layanan Online Desa: memuat sekali dari endpoint publik `rekap`. */
export function PengaduanRekapSection() {
  const state = useLoadOnce(loadPengaduanRekap, 'rekap tindak lanjut pengaduan (Layanan Online Desa)');
  const titleId = useId();

  return (
    <section className={s.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={s.title}>
        {T.title}
      </h2>
      <p className={s.lead}>{T.lead}</p>
      {state.status === 'loading' ? <div className={s.placeholder} aria-busy="true" aria-label={T.loading} /> : null}
      {state.status === 'error' ? (
        <p className={s.empty} role="alert">
          {T.error}
        </p>
      ) : null}
      {state.status === 'ready' ? <PengaduanRekapView rekap={state.data} /> : null}
    </section>
  );
}
