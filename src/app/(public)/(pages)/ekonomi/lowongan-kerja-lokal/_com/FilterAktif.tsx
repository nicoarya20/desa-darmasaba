'use client';
import { IconX } from '@tabler/icons-react';
import { FILTER_GROUP_ICON } from './FilterGroup';
import type { FilterChip } from './lowongan-filter.logic';
import { LOWONGAN_FILTER_TEXT as T } from './lowongan-filter.text';
import type { LowonganParams } from './lowongan-params.logic';
import s from './filter.module.css';

type Props = {
  chips: readonly FilterChip[];
  /** Terapkan params hasil menghapus satu chip. */
  onApply: (next: LowonganParams) => void;
  onClearAll: () => void;
};

/** Chip filter aktif (ikon grup + label + ×) diikuti "Hapus semua"; tidak merender apa pun bila tanpa filter. */
export function FilterChips({ chips, onApply, onClearAll }: Props) {
  if (chips.length === 0) return null;
  return (
    <ul className={s.chips}>
      {chips.map((chip) => {
        const GroupIcon = FILTER_GROUP_ICON[chip.group];
        return (
          <li key={chip.key} className={s.chip}>
            <GroupIcon size={14} stroke={1.75} aria-hidden />
            <span className={s.chipLabel}>{chip.label}</span>
            <button type="button" className={s.chipRemove} onClick={() => onApply(chip.next)} aria-label={T.hapusChip(chip.label)}>
              <IconX size={14} stroke={2} aria-hidden />
            </button>
          </li>
        );
      })}
      <li>
        <button type="button" className={s.clearAll} onClick={onClearAll}>
          {T.hapusSemua}
        </button>
      </li>
    </ul>
  );
}

/** Kotak "Pilihan Anda" di panel Filter: chip filter aktif, atau keterangan bila belum ada yang dipilih. */
export function FilterAktif({ chips, onApply, onClearAll }: Props) {
  return (
    <section className={s.aktif}>
      <h3 className={s.boxTitle}>{T.pilihanAnda}</h3>
      {chips.length > 0 ? (
        <FilterChips chips={chips} onApply={onApply} onClearAll={onClearAll} />
      ) : (
        <p className={s.aktifEmpty}>{T.belumAdaFilter}</p>
      )}
    </section>
  );
}
