'use client';
import { Drawer } from '@mantine/core';
import { FilterPanel } from './FilterPanel';
import type { FilterChip, LowonganFacets } from './lowongan-filter.logic';
import { LOWONGAN_BRAND_VARS } from './lowongan-filter.meta';
import { LOWONGAN_FILTER_TEXT as T } from './lowongan-filter.text';
import type { LowonganParams, LowonganUpdate } from './lowongan-params.logic';
import s from './filter.module.css';

type Props = {
  opened: boolean;
  onClose: () => void;
  params: LowonganParams;
  facets: LowonganFacets | null;
  chips: readonly FilterChip[];
  update: LowonganUpdate;
  /** Banyak hasil saat ini untuk tombol "Tampilkan N lowongan". */
  shown: number;
  onClearAll: () => void;
};

/** Panel Filter ponsel/tablet (≤1068px): lembar dari bawah, filter berlaku langsung, kaki menempel. */
export function FilterDrawer({ opened, onClose, params, facets, chips, update, shown, onClearAll }: Props) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      title={T.filter}
      style={LOWONGAN_BRAND_VARS}
      closeButtonProps={{ 'aria-label': T.tutup }}
      classNames={{ content: s.drawer, header: s.drawerHeader, title: s.drawerTitle, body: s.drawerBody }}
    >
      <div className={s.drawerScroll}>
        <FilterPanel params={params} facets={facets} chips={chips} update={update} onClearAll={onClearAll} bare />
      </div>
      <div className={s.drawerFooter}>
        <button type="button" className={s.drawerClear} onClick={onClearAll}>
          {T.hapusSemua}
        </button>
        <button type="button" className={s.drawerApply} onClick={onClose}>
          {T.tampilkan(shown)}
        </button>
      </div>
    </Drawer>
  );
}
