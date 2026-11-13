'use client';
import { Collapse } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useId, useState, type ReactNode } from 'react';
import type { FacetOption } from './katalog-filter.logic';
import { TOKO_FACET_VISIBLE } from './katalog-filter.meta';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import s from './saring.module.css';

type GroupProps = {
  label: string;
  /** Banyak nilai aktif di grup ini; > 0 → angka kecil di samping label. */
  activeCount: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

/** Satu grup akordeon panel saring gaya Decathlon: baris label + ikon +/−, isi dibuka/tutup beranimasi. */
export function SaringGroup({ label, activeCount, defaultOpen = false, children }: GroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  return (
    <div className={s.group}>
      <button
        type="button"
        className={s.groupHead}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={s.groupLabel}>
          {label}
          {activeCount > 0 ? <span className={s.groupBadge}>{activeCount}</span> : null}
        </span>
        {open ? <IconMinus size={18} stroke={1.75} aria-hidden /> : <IconPlus size={18} stroke={1.75} aria-hidden />}
      </button>
      <Collapse expanded={open} id={contentId} keepMountedMode="display-none">
        <div className={s.groupBody}>{children}</div>
      </Collapse>
    </div>
  );
}

type CheckProps = {
  label: string;
  count: number;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
};

/** Kotak centang + label + jumlah rata kanan. */
export function SaringCheck({ label, count, checked, disabled, onChange }: CheckProps) {
  return (
    <label className={s.option} data-disabled={disabled || undefined}>
      <input type="checkbox" className={s.checkbox} checked={checked} disabled={disabled} onChange={onChange} />
      <span className={s.optionLabel}>{label}</span>
      <span className={s.optionCount}>{count}</span>
    </label>
  );
}

type ListProps = {
  options: readonly FacetOption[];
  selected: readonly string[];
  onToggle: (id: string) => void;
  /** Batasi tampilan ke beberapa pilihan pertama + tombol "Lihat semua (n)". */
  collapsible?: boolean;
};

/** Daftar kotak centang banyak pilihan; pilihan yang sedang dicentang selalu tampil walau di luar batas. */
export function SaringCheckList({ options, selected, onToggle, collapsible = false }: ListProps) {
  const [showAll, setShowAll] = useState(false);
  const limited = collapsible && !showAll && options.length > TOKO_FACET_VISIBLE;
  const visible = limited
    ? options.filter((o, i) => i < TOKO_FACET_VISIBLE || selected.includes(o.id))
    : options;
  return (
    <>
      <ul className={s.options}>
        {visible.map((option) => (
          <li key={option.id}>
            <SaringCheck
              label={option.label}
              count={option.count}
              checked={selected.includes(option.id)}
              onChange={() => onToggle(option.id)}
            />
          </li>
        ))}
      </ul>
      {collapsible && options.length > TOKO_FACET_VISIBLE ? (
        <button type="button" className={s.more} onClick={() => setShowAll((v) => !v)}>
          {showAll ? T.lebihSedikit : T.lihatSemua(options.length)}
        </button>
      ) : null}
    </>
  );
}
