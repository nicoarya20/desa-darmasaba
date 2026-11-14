'use client';
import { Select } from '@mantine/core';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useId } from 'react';
import { FilterChips } from './FilterAktif';
import { urutOptions, type FilterChip } from './lowongan-filter.logic';
import type { LowonganUrut } from './lowongan-filter.meta';
import { LOWONGAN_FILTER_TEXT as T } from './lowongan-filter.text';
import type { LowonganParams } from './lowongan-params.logic';
import s from './lowongan-layout.module.css';

type Props = {
  /** null = data belum siap (jumlah dikosongkan). */
  count: { shown: number; total: number } | null;
  urut: LowonganUrut;
  onUrut: (urut: LowonganUrut) => void;
  chips: readonly FilterChip[];
  activeCount: number;
  onApply: (next: LowonganParams) => void;
  onClearAll: () => void;
  /** Buka drawer Filter (pil hanya tampil ≤1068px). */
  onOpenFilter: () => void;
};

const URUT_OPTIONS = urutOptions();

/** Baris alat di atas daftar: jumlah lowongan, pil Filter (tablet/ponsel), Urutkan, lalu chip filter aktif (≤1068px). */
export function LowonganToolbar({ count, urut, onUrut, chips, activeCount, onApply, onClearAll, onOpenFilter }: Props) {
  const urutId = useId();
  return (
    <div className={s.toolbar}>
      <div className={s.toolbarRow}>
        <h2 className={s.count} aria-live="polite">
          {count ? (
            <>
              <strong>{count.shown}</strong> {T.noun}
              {count.shown === count.total ? null : <span className={s.countOf}> {T.dari(count.total)}</span>}
            </>
          ) : (
            <span className={s.srOnly}>{T.listTitle}</span>
          )}
        </h2>
        <div className={s.toolbarActions}>
          <button type="button" className={s.filterPill} onClick={onOpenFilter} aria-haspopup="dialog">
            <IconAdjustmentsHorizontal size={18} stroke={1.75} aria-hidden />
            {T.filter}
            {activeCount > 0 ? (
              <span className={s.filterBadge} aria-label={T.filterAktif(activeCount)}>
                {activeCount}
              </span>
            ) : null}
          </button>
          <label htmlFor={urutId} className={s.urutLabel}>
            {T.urutkan}
          </label>
          <Select
            id={urutId}
            className={s.urutSelect}
            data={URUT_OPTIONS}
            value={urut}
            onChange={(next) => {
              const picked = URUT_OPTIONS.find((o) => o.value === next)?.value;
              if (picked) onUrut(picked);
            }}
            allowDeselect={false}
            checkIconPosition="right"
            radius="xl"
            comboboxProps={{ position: 'bottom-end', width: 200 }}
          />
        </div>
      </div>
      {/* Di desktop chip sudah ada di kotak "Pilihan Anda" panel kiri; baris ini hanya untuk ≤1068px. */}
      {chips.length > 0 ? (
        <div className={s.toolbarChips}>
          <FilterChips chips={chips} onApply={onApply} onClearAll={onClearAll} />
        </div>
      ) : null}
    </div>
  );
}
