'use client';
import { Drawer } from '@mantine/core';
import type { ProdukFacets, TokoFacets } from './katalog-filter.logic';
import { KATALOG_BRAND_VARS, type KatalogTab } from './katalog-filter.meta';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import type { KatalogParams } from './katalog-params.logic';
import { SaringPanel, type KatalogUpdate } from './SaringPanel';
import s from './saring.module.css';

type Props = {
  opened: boolean;
  onClose: () => void;
  tab: KatalogTab;
  params: KatalogParams;
  facets: ProdukFacets | TokoFacets | null;
  update: KatalogUpdate;
  /** Banyak hasil saat ini untuk tombol "Tampilkan N produk". */
  shown: number;
  onClearAll: () => void;
};

/** Panel saring ponsel/tablet (≤1068px): lembar dari bawah, saringan berlaku langsung, kaki menempel. */
export function SaringDrawer({ opened, onClose, tab, params, facets, update, shown, onClearAll }: Props) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      title={T.saring}
      style={KATALOG_BRAND_VARS}
      closeButtonProps={{ 'aria-label': T.tutup }}
      classNames={{ content: s.drawer, header: s.drawerHeader, title: s.drawerTitle, body: s.drawerBody }}
    >
      <div className={s.drawerScroll}>
        <SaringPanel params={params} facets={facets} update={update} />
      </div>
      <div className={s.drawerFooter}>
        <button type="button" className={s.drawerClear} onClick={onClearAll}>
          {T.hapusSemua}
        </button>
        <button type="button" className={s.drawerApply} onClick={onClose}>
          {T.tampilkan(shown, T.noun[tab])}
        </button>
      </div>
    </Drawer>
  );
}
