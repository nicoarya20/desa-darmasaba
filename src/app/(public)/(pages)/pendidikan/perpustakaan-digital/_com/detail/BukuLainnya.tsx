'use client';
import { useRailScroll } from '@/app/(public)/_com/main-page/landing-page/use-rail-scroll';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useMemo } from 'react';
import { BukuCard } from '../BukuCard';
import { usePerpusData } from '../PerpusDataProvider';
import { bukuLainnya } from '../perpus-katalog.logic';
import { BUKU_DETAIL_TEXT as T } from '../perpus.text';
import type { Buku } from '../perpus.types';
import s from './buku-lainnya.module.css';

const TITLE_ID = 'buku-lain-judul';

/**
 * Rel geser "Buku lain di kategori ini" (maks 12, data katalog dari layout). Hanya dirender bila data siap dan ada
 * buku lain: rel ini pelengkap, jadi saat memuat/galat cukup tidak tampil (detail utama tetap utuh).
 */
export function BukuLainnya({ current }: { current: Pick<Buku, 'id' | 'kategori'> }) {
  const { state } = usePerpusData();
  const items = useMemo(() => (state.status === 'ready' ? bukuLainnya(state.data, current) : []), [state, current]);
  const { railRef, state: rail, step } = useRailScroll(items.length);

  if (items.length === 0) return null;

  return (
    <section className={s.section} aria-labelledby={TITLE_ID}>
      <div className={s.head}>
        <h2 id={TITLE_ID} className={s.title}>
          {T.lainTitle}
        </h2>
        <p className={s.count}>{T.lainJumlah(items.length)}</p>
      </div>
      <div className={s.frame}>
        <ul ref={railRef} className={s.rail} aria-labelledby={TITLE_ID}>
          {items.map((buku) => (
            <li key={buku.id} className={s.item}>
              <BukuCard buku={buku} />
            </li>
          ))}
        </ul>
        {rail.canPrev && (
          <button type="button" className={`${s.arrow} ${s.prev}`} onClick={() => step(-1)} aria-label={T.sebelumnya}>
            <IconChevronLeft size={20} stroke={2} aria-hidden="true" />
          </button>
        )}
        {rail.canNext && (
          <button type="button" className={`${s.arrow} ${s.next}`} onClick={() => step(1)} aria-label={T.berikutnya}>
            <IconChevronRight size={20} stroke={2} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
