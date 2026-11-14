'use client';
import { Collapse } from '@mantine/core';
import {
  IconBriefcase,
  IconCalendarEvent,
  IconCash,
  IconCheck,
  IconChevronDown,
  IconMapPin,
  type Icon,
} from '@tabler/icons-react';
import { useId, useState, type ReactNode } from 'react';
import type { FilterGroupKey } from './lowongan-filter.logic';
import { LOWONGAN_FILTER_TEXT as T } from './lowongan-filter.text';
import s from './filter-group.module.css';

/** Ikon tiap grup filter; dipakai kepala grup dan chip filter aktif. */
export const FILTER_GROUP_ICON: Record<FilterGroupKey, Icon> = {
  tipe: IconBriefcase,
  lokasi: IconMapPin,
  gaji: IconCash,
  tayang: IconCalendarEvent,
};

type GroupProps = {
  group: FilterGroupKey;
  /** Banyak nilai aktif di grup ini; > 0 → angka kecil di samping label. */
  activeCount: number;
  /** Terbuka saat pertama dirender; grup dengan nilai aktif selalu terbuka saat pertama dirender. */
  defaultOpen?: boolean;
  children: ReactNode;
};

/** Satu grup akordeon panel Filter: kepala ikon + label + chevron, isi dibuka/tutup beranimasi. */
export function FilterGroup({ group, activeCount, defaultOpen = false, children }: GroupProps) {
  // Grup yang sudah punya nilai aktif (dari URL) terbuka saat pertama dirender.
  const [open, setOpen] = useState(defaultOpen || activeCount > 0);
  const contentId = useId();
  const GroupIcon = FILTER_GROUP_ICON[group];
  return (
    <div className={s.group}>
      <button
        type="button"
        className={s.groupHead}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
      >
        <GroupIcon size={18} stroke={1.75} aria-hidden />
        <span className={s.groupLabel}>
          {T.group[group]}
          {activeCount > 0 ? <span className={s.groupBadge}>{activeCount}</span> : null}
        </span>
        <IconChevronDown className={s.chevron} size={18} stroke={1.75} aria-hidden />
      </button>
      <Collapse expanded={open} id={contentId} keepMountedMode="display-none">
        <div className={s.groupBody}>{children}</div>
      </Collapse>
    </div>
  );
}

/** Satu pil pilihan beserta jumlah lowongannya. */
export type PillOption<V extends string | number> = { value: V; label: string; count: number };

type ListProps<V extends string | number> = {
  options: readonly PillOption<V>[];
  isSelected: (value: V) => boolean;
  onToggle: (value: V) => void;
};

/** Daftar pil pilihan (tombol `aria-pressed`, satu per baris). */
export function FilterPillList<V extends string | number>({ options, isSelected, onToggle }: ListProps<V>) {
  return (
    <ul className={s.pills}>
      {options.map((option) => {
        const pressed = isSelected(option.value);
        return (
          <li key={option.value}>
            <button type="button" className={s.pill} aria-pressed={pressed} onClick={() => onToggle(option.value)}>
              {pressed ? <IconCheck size={16} stroke={2} aria-hidden /> : null}
              <span className={s.pillLabel}>{option.label}</span>
              <span className={s.pillCount}>{option.count}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
