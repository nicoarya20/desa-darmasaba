'use client';

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { MUSIK_TEXT as T } from './musik-library.text';
import { nextEdges } from './shelf-row.logic';
import s from './shelf-row.module.css';

type Props = {
  title: string;
  /** Tujuan "Lihat semua"; tanpa href → tautan tidak dirender. */
  href?: string;
  /** 'scroll' = rak gulir horizontal + panah; 'grid' = kisi baris lagu. */
  layout: 'scroll' | 'grid';
  /** Isi rak berupa elemen `<li>`. */
  children: ReactNode;
};

/** Satu klik panah menggeser 90% lebar rak supaya kartu terakhir tetap terlihat sebagai jangkar. */
const PAGE_RATIO = 0.9;

/**
 * Rak berjudul (h2) dengan "Lihat semua"; rak horizontal punya panah ‹ › yang nonaktif di ujung (`aria-disabled`,
 * bukan `disabled`: tombol yang baru dipakai tetap memegang fokus saat rak mencapai ujung).
 */
export function ShelfRow({ title, href, layout, children }: Props) {
  const headingId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const metrics = { scrollLeft: el.scrollLeft, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth };
    setEdges((prev) => nextEdges(prev, metrics));
  }, []);

  // Isi rak berubah (jumlah item) → ukur ulang. Bukan `children` di deps: elemennya baru di setiap render induk,
  // sehingga listener & ResizeObserver dipasang ulang terus.
  const itemCount = Children.count(children);

  useEffect(() => {
    const el = listRef.current;
    if (layout !== 'scroll' || !el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [layout, measure, itemCount]);

  const page = (direction: -1 | 1) => {
    const el = listRef.current;
    // Panah di ujung hanya aria-disabled (fokus tetap di tombol), jadi kliknya diabaikan di sini.
    if (!el || (direction < 0 ? edges.start : edges.end)) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * el.clientWidth * PAGE_RATIO, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section className={s.shelf} data-layout={layout} aria-labelledby={headingId}>
      <div className={s.head}>
        <h2 id={headingId} className={s.title}>
          {title}
        </h2>
        <div className={s.tools}>
          {href ? (
            <Link href={href} className={s.more}>
              {T.lihatSemua}
            </Link>
          ) : null}
          {layout === 'scroll' ? (
            <>
              <button
                type="button"
                className={s.arrow}
                aria-label={T.geserKiri}
                aria-disabled={edges.start}
                onClick={() => page(-1)}
              >
                <IconChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={s.arrow}
                aria-label={T.geserKanan}
                aria-disabled={edges.end}
                onClick={() => page(1)}
              >
                <IconChevronRight size={18} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </div>
      <ul ref={listRef} className={layout === 'scroll' ? s.scroll : s.grid}>
        {children}
      </ul>
    </section>
  );
}
