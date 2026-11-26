'use client';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconAdjustmentsHorizontal, IconX } from '@tabler/icons-react';
import type { FilterChip } from './katalog-filter.logic';
import type { KatalogTab, KatalogUrut } from './katalog-filter.meta';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import type { KatalogParams } from './katalog-params.logic';
import s from './katalog-layout.module.css';
import { KatalogUrutSelect } from './KatalogUrutSelect';

type Props = {
  tab: KatalogTab;
  /** null = data belum siap (jumlah disembunyikan). */
  count: { shown: number; total: number } | null;
  urut: KatalogUrut;
  onUrut: (urut: KatalogUrut) => void;
  /** false = harga disembunyikan admin → Urutkan tanpa pilihan harga. */
  denganHarga?: boolean;
  chips: readonly FilterChip[];
  activeCount: number;
  onApply: (next: KatalogParams) => void;
  onClearAll: () => void;
  /** Buka drawer saring (tombol hanya tampil ≤1068px). */
  onOpenSaring: () => void;
};

/** Baris alat di atas grid: jumlah hasil, pil Filter (tablet/ponsel), Urutkan, lalu chip saringan aktif. */
export function KatalogToolbar({ tab, count, urut, onUrut, denganHarga = true, chips, activeCount, onApply, onClearAll, onOpenSaring }: Props) {
  return (
    <div className={s.toolbar}>
      <div className={s.toolbarRow}>
        <p className={s.count} aria-live="polite">
          {count ? <CountText tab={tab} {...count} /> : null}
        </p>
        <div className={s.toolbarActions}>
          <button type="button" className={s.saringPill} onClick={onOpenSaring} aria-haspopup="dialog">
            <IconAdjustmentsHorizontal size={18} stroke={1.75} aria-hidden />
            {T.saring}
            {activeCount > 0 ? (
              <span className={s.saringBadge} aria-label={T.saringAktif(activeCount)}>
                {activeCount}
              </span>
            ) : null}
          </button>
          <KatalogUrutSelect tab={tab} value={urut} onChange={onUrut} denganHarga={denganHarga} />
        </div>
      </div>
      {chips.length > 0 ? (
        <ul className={s.chips}>
          {chips.map((chip) => (
            <li key={chip.key}>
              <button type="button" className={s.chip} onClick={() => onApply(chip.next)} aria-label={T.hapusChip(chip.label)}>
                {chip.label}
                <IconX size={14} stroke={2} aria-hidden />
              </button>
            </li>
          ))}
          <li>
            <button type="button" className={`${s.clearAll} ${r.trigger}`} onClick={onClearAll}>
              <span className={r.cta} data-text={T.hapusSemua}>
                {T.hapusSemua}
              </span>
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

/** "Menampilkan **7** produk" atau "Menampilkan **3** dari 7 produk". */
function CountText({ tab, shown, total }: { tab: KatalogTab; shown: number; total: number }) {
  const noun = T.noun[tab];
  return (
    <>
      {T.menampilkan} <strong>{shown}</strong> {shown === total ? noun : T.dari(total, noun)}
    </>
  );
}
