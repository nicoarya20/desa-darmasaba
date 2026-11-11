'use client';
import { toSentenceCase } from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.logic';
import { useEffect, useRef } from 'react';
import s from './antikorupsi-detail.module.css';
import { AK_DETAIL_TEXT } from './antikorupsi-detail.text';

type Props = {
  categories: readonly string[];
  counts: Readonly<Record<string, number>>;
  selected: string;
  onSelect: (kategori: string) => void;
};

/** Pil kategori indikator (label sentence case + jumlah). Di ponsel baris pil digeser horizontal. */
export function AntiKorupsiKategoriPills({ categories, counts, selected, onSelect }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  // Pil aktif bisa di luar layar di ponsel (mis. dibuka via ?kategori=KEARIFAN LOKAL): geser barisnya saja,
  // bukan scrollIntoView yang ikut menggulir halaman.
  useEffect(() => {
    const row = rowRef.current;
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !active || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2;
  }, [selected, categories.length]);

  return (
    <div ref={rowRef} className={s.pills} role="group" aria-label={AK_DETAIL_TEXT.filterLabel}>
      {categories.map((kategori) => (
        <button
          key={kategori}
          type="button"
          className={s.pill}
          aria-pressed={kategori === selected}
          onClick={() => onSelect(kategori)}
        >
          {toSentenceCase(kategori)}
          <span className={s.pillCount}>{counts[kategori] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
