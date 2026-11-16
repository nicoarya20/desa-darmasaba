import { Image } from '@mantine/core';
import { IconHeartHandshake } from '@tabler/icons-react';
import type { Mitra } from './mitra.logic';
import s from './mitra.module.css';
import { KOLABORASI_TEXT as T } from './kolaborasi.text';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';

const TITLE_ID = 'mitra-kolaborasi-title';
const PLACEHOLDER_TILES = 4;

/**
 * Bagian Mitra Kolaborasi: dinding logo ubin #f5f5f7 rasio 3:2 (logo utuh, `contain`), nama di bawah; 4/3/2 kolom.
 * Tanpa mitra atau galat (sudah dilog di `useLoadOnce`) → bagian tidak dirender agar daftar kolaborasi tetap utuh.
 */
export function MitraWall({ state }: { state: LoadState<Mitra[]> }) {
  if (state.status === 'error' || (state.status === 'ready' && state.data.length === 0)) return null;

  return (
    <section className={s.mitra} aria-labelledby={TITLE_ID}>
      <div className={s.intro}>
        <h2 id={TITLE_ID} className={s.heading}>
          {T.mitraTitle}
        </h2>
        <p className={s.lead}>{T.mitraLead}</p>
      </div>
      {state.status === 'loading' ? (
        <ul className={s.wall} aria-busy="true" aria-label={T.mitraLoading}>
          {Array.from({ length: PLACEHOLDER_TILES }, (_, i) => (
            <li key={i} className={`${s.tile} ${s.placeholder}`} aria-hidden />
          ))}
        </ul>
      ) : (
        <ul className={s.wall}>
          {state.data.map((mitra) => (
            <li key={mitra.id} className={s.item}>
              <div className={s.tile}>
                {mitra.logoUrl ? (
                  // Nama mitra tampil di bawah ubin → logo dekoratif bagi pembaca layar. Ukuran lewat prop (inline) agar
                  // tidak kalah oleh `width: 100%` bawaan Mantine Image; posisi di `.logo`.
                  <Image src={mitra.logoUrl} alt="" fit="contain" w="64%" h="68%" className={s.logo} loading="lazy" decoding="async" />
                ) : (
                  <IconHeartHandshake className={s.noLogo} size={40} stroke={1.25} aria-hidden />
                )}
              </div>
              <p className={s.name}>{mitra.name}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
