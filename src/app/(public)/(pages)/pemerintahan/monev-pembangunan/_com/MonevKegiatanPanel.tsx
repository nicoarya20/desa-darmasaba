import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { KabarListPagination } from "@/app/(public)/_com/kabar-list/KabarListPagination";
import type { MonevKegiatan } from "@/app/admin/(dashboard)/_state/desa/monevPembangunan";
import type { RkpRef } from "@/lib/dokumen-perencanaan";
import { ScrollArea, SegmentedControl } from "@mantine/core";
import { FILTER_ALL, FILTER_OPTIONS } from "./monev.logic";
import s from "./monev.module.css";
import r from "./monev-rows.module.css";
import { MONEV_TEXT } from "./monev.text";
import { MonevKegiatanRow } from "./MonevKegiatanRow";
import { MonevNotice, RowsSkeleton } from "./MonevStates";

const SKELETON_ROWS = 4;
const TITLE_ID = "monev-kegiatan-title";

type Props = {
  items: readonly MonevKegiatan[];
  loading: boolean;
  failed: boolean;
  filter: string;
  onFilterChange: (value: string) => void;
  onRetry: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  rkpIndex?: ReadonlyMap<number, RkpRef>;
};

/** Panel "Daftar kegiatan": saring status (Semua/Rencana/Berjalan/Selesai), baris kegiatan, paginasi. */
export function MonevKegiatanPanel(props: Props) {
  const { filter, onFilterChange, page, totalPages, onPageChange } = props;

  return (
    <>
      <section className={apb.panel} aria-labelledby={TITLE_ID}>
        <div className={s.panelHead}>
          <div>
            <h2 id={TITLE_ID} className={apb.panelTitle}>
              {MONEV_TEXT.listTitle}
            </h2>
            <p className={s.panelLead}>{MONEV_TEXT.listLead}</p>
          </div>
          <ScrollArea type="never" className={s.segScroll}>
            <SegmentedControl
              aria-label={MONEV_TEXT.filterLabel}
              radius="xl"
              data={FILTER_OPTIONS}
              value={filter}
              onChange={onFilterChange}
              classNames={{ root: s.segRoot }}
            />
          </ScrollArea>
        </div>
        <PanelContent {...props} />
      </section>
      <KabarListPagination total={totalPages} value={page} label={MONEV_TEXT.pagination} onChange={onPageChange} />
    </>
  );
}

function PanelContent({ items, loading, failed, filter, onRetry, rkpIndex }: Props) {
  if (loading) return <RowsSkeleton count={SKELETON_ROWS} label={MONEV_TEXT.loading} />;
  if (failed) return <MonevNotice message={MONEV_TEXT.listFailed} onRetry={onRetry} />;
  if (items.length === 0) {
    // Panel hanya dirender bila ada kegiatan; daftar kosong berarti filter status tak punya hasil.
    return <p className={s.notice}>{filter === FILTER_ALL ? MONEV_TEXT.emptyTitle : MONEV_TEXT.listEmptyFiltered}</p>;
  }

  return (
    <>
      <div className={r.rowHead} aria-hidden>
        <span>{MONEV_TEXT.colKegiatan}</span>
        <span>{MONEV_TEXT.colProgres}</span>
        <span>{MONEV_TEXT.colAnggaran}</span>
      </div>
      <ul className={r.rows}>
        {items.map((item) => (
          <MonevKegiatanRow key={item.id} item={item} rkpIndex={rkpIndex} />
        ))}
      </ul>
    </>
  );
}
