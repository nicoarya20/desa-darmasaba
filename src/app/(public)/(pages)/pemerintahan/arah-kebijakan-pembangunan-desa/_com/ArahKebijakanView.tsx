import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { KabarListPagination } from "@/app/(public)/_com/kabar-list/KabarListPagination";
import type { LoadState } from "@/app/(public)/_com/load-once/use-load-once";
import BackButton from "@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto";
import type { JenisDokumen } from "@/lib/dokumen-perencanaan";
import { ScrollArea, SegmentedControl } from "@mantine/core";
import type { ArahDokumenPage } from "./arah-kebijakan.logic";
import { ARAH_BRAND_VARS } from "./arah-kebijakan.meta";
import s from "./arah-kebijakan.module.css";
import { ARAH_TEXT as T, KATEGORI_TEXT } from "./arah-kebijakan.text";
import { DokumenTabel } from "./DokumenTabel";

const TITLE_ID = "arah-kebijakan-title";
const PANEL_ID = "arah-kebijakan-panel";

type Props = {
  /** Tab yang tampil, berurutan (Berita Acara hanya bila sudah ada dokumen). */
  kategoriList: readonly JenisDokumen[];
  kategori: JenisDokumen;
  onKategoriChange: (kategori: JenisDokumen) => void;
  state: LoadState<ArahDokumenPage>;
  page: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

/** Tampilan halaman: kepala, tab kategori, tabel dokumen kategori terpilih, dan paginasi (tanpa pengambilan data). */
export function ArahKebijakanView({ kategoriList, kategori, onKategoriChange, state, page, onPageChange, onRetry }: Props) {
  const teks = KATEGORI_TEXT[kategori];
  const tabs = kategoriList.map((value) => ({ value, label: KATEGORI_TEXT[value].tab }));
  return (
    <section className={`${apb.section} ${apb.page}`} style={ARAH_BRAND_VARS} aria-labelledby={TITLE_ID}>
      <div className={apb.inner}>
        <div className={apb.back}>
          <BackButton />
        </div>
        <header className={apb.header}>
          <h1 id={TITLE_ID} className={apb.title}>{T.pageTitle}</h1>
          <p className={apb.lead}>{T.pageLead}</p>
        </header>

        <div className={s.body}>
          <ScrollArea type="never" className={s.segScroll}>
            <SegmentedControl
              aria-label={T.tabsLabel}
              radius="xl"
              data={tabs}
              value={kategori}
              onChange={(value) => onKategoriChange(value as JenisDokumen)}
              classNames={{ root: s.segRoot }}
            />
          </ScrollArea>

          <section id={PANEL_ID} className={apb.panel} aria-labelledby={`${PANEL_ID}-title`} aria-busy={state.status === "loading"}>
            <h2 id={`${PANEL_ID}-title`} className={apb.panelTitle}>{teks.title}</h2>
            <p className={s.panelLead}>{teks.lead}</p>
            <DokumenTabel kategori={kategori} state={state} page={page} onRetry={onRetry} />
          </section>
          <KabarListPagination
            total={state.status === "ready" ? state.data.totalPages : 1}
            value={page}
            label={T.pagination}
            onChange={onPageChange}
          />
        </div>
      </div>
    </section>
  );
}
