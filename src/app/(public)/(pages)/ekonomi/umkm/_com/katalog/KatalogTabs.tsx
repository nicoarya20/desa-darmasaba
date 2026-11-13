'use client';
import { IconBuildingStore, IconPackage } from '@tabler/icons-react';
import { useRef, type KeyboardEvent } from 'react';
import { KATALOG_TABS, type KatalogTab } from './katalog-filter.meta';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import s from './katalog-layout.module.css';

const ICONS = { produk: IconPackage, toko: IconBuildingStore } as const;

/** Id elemen tab & panelnya (dipakai `aria-controls` / `aria-labelledby`). */
export const katalogTabId = (tab: KatalogTab) => `katalog-tab-${tab}`;
export const KATALOG_PANEL_ID = 'katalog-panel';

type Props = { value: KatalogTab; onChange: (tab: KatalogTab) => void };

/** Tab Produk | Toko gaya Tokopedia: garis bawah brand pada tab aktif; panah kiri/kanan berpindah tab. */
export function KatalogTabs({ value, onChange }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = KATALOG_TABS[(KATALOG_TABS.indexOf(value) + step + KATALOG_TABS.length) % KATALOG_TABS.length];
    onChange(next);
    listRef.current?.querySelector<HTMLElement>(`#${katalogTabId(next)}`)?.focus();
  };

  return (
    <div ref={listRef} className={s.tabs} role="tablist" aria-label={T.tabsLabel} onKeyDown={onKeyDown}>
      {KATALOG_TABS.map((tab) => {
        const Icon = ICONS[tab];
        const active = tab === value;
        return (
          <button
            key={tab}
            id={katalogTabId(tab)}
            type="button"
            role="tab"
            className={s.tab}
            aria-selected={active}
            aria-controls={KATALOG_PANEL_ID}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab)}
          >
            <Icon size={20} stroke={1.75} aria-hidden />
            {T.tab[tab]}
          </button>
        );
      })}
    </div>
  );
}
