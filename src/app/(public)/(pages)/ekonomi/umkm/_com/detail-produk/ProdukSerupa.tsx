'use client';
import { useRailScroll } from '@/app/(public)/_com/main-page/landing-page/use-rail-scroll';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { ProdukCard } from '../katalog/ProdukCard';
import s from './produk-serupa.module.css';
import { PRODUK_SERUPA_TEXT as T } from './produk-serupa.text';
import { panahPenggantiFokus, type ProdukSerupaAcuan, type RelArah } from './produk-serupa.logic';
import { useProdukSerupa } from './use-produk-serupa';

const TITLE_ID = 'produk-serupa-judul';
const SKELETON_COUNT = 4;
/** Baris kerangka meniru teks kartu: harga, nama, toko. */
const SKELETON_LINES = ['45%', '90%', '60%'];

/** Rel geser Produk serupa (kategori sama, lalu UMKM sama); tidak dirender bila tidak ada produk serupa. */
export function ProdukSerupa({ current }: { current: ProdukSerupaAcuan }) {
  const { state, retry } = useProdukSerupa(current);
  const items = state.status === 'ready' ? state.data : [];
  const { railRef, state: rail, step } = useRailScroll(items.length);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const diklikRef = useRef<RelArah | null>(null);
  const geser = (arah: RelArah) => {
    diklikRef.current = arah;
    step(arah);
  };

  // Panah yang diklik hilang saat rel sampai ujung → fokus ke panah sisi lain, hanya bila fokus memang jatuh ke body
  // (bukan merebut fokus yang sudah dipindah pengguna ke tempat lain).
  useEffect(() => {
    const target = panahPenggantiFokus(diklikRef.current, rail.canPrev, rail.canNext);
    if (diklikRef.current === 1 ? !rail.canNext : !rail.canPrev) diklikRef.current = null;
    const fokusJatuh = document.activeElement == null || document.activeElement === document.body;
    if (target && fokusJatuh) (target === 'prev' ? prevRef : nextRef).current?.focus();
  }, [rail.canPrev, rail.canNext]);

  if (state.status === 'ready' && items.length === 0) return null;

  return (
    <section className={s.section} aria-labelledby={TITLE_ID}>
      <div className={s.head}>
        <h2 id={TITLE_ID} className={s.title}>
          {T.judul}
        </h2>
        {state.status === 'ready' && <p className={s.count}>{T.jumlah(items.length)}</p>}
      </div>

      {state.status === 'error' ? (
        <div className={s.error} role="alert">
          <p className={s.errorText}>{T.gagal}</p>
          <button type="button" className={s.retry} onClick={retry}>
            {T.cobaLagi}
          </button>
        </div>
      ) : state.status !== 'ready' ? (
        <ul className={s.rail} aria-busy="true" aria-label={T.memuat}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <li key={i} className={s.item} aria-hidden="true">
              <div className={s.skeletonMedia} />
              {SKELETON_LINES.map((width, j) => (
                <div key={j} className={s.skeletonLine} style={{ width }} />
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <div className={s.frame}>
          <ul ref={railRef} className={s.rail} aria-labelledby={TITLE_ID}>
            {items.map((produk) => (
              <li key={produk.id} className={s.item}>
                <ProdukCard produk={produk} />
              </li>
            ))}
          </ul>
          {rail.canPrev && (
            <button
              ref={prevRef}
              type="button"
              className={`${s.arrow} ${s.prev}`}
              onClick={() => geser(-1)}
              aria-label={T.sebelumnya}
            >
              <IconChevronLeft size={20} stroke={2} aria-hidden="true" />
            </button>
          )}
          {rail.canNext && (
            <button
              ref={nextRef}
              type="button"
              className={`${s.arrow} ${s.next}`}
              onClick={() => geser(1)}
              aria-label={T.berikutnya}
            >
              <IconChevronRight size={20} stroke={2} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
