'use client';
import { KabarListHeader } from "@/app/(public)/_com/kabar-list/KabarListHeader";
import { useLazyLoad } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import frame from "../../_com/page-frame/page-frame.module.css";
import { jenjangTabs, PENGAJAR_PATH, type InfoSekolahQuery } from "./info-sekolah.logic";
import { INFO_SEKOLAH_BRAND_VARS } from "./info-sekolah.meta";
import { loadJenjangNames, loadPengajarPage } from "./info-sekolah.source";
import s from "./info-sekolah.module.css";
import { INFO_SEKOLAH_TEXT as T } from "./info-sekolah.text";
import { PengajarResults } from "./PengajarResults";
import { useInfoSekolahQuery } from "./use-info-sekolah-query";

/** Daftar pengajar di kerangka Pendidikan: kepala gaya Kabar (judul, cari, pil jenjang) + baris pengajar berpaginasi server. */
export function PengajarPage() {
  const { query, setSearch, setPage } = useInfoSekolahQuery();
  const jenjang = useLazyLoad(loadJenjangNames, true, "daftar jenjang pendidikan");
  // Galat daftar jenjang tidak menghalangi daftar: pil cukup "Semua" + jenjang di URL.
  const names = jenjang.state.status === "ready" ? jenjang.state.data : [];
  const queryKey = `${query.jenjang}|${query.search}|${query.page}`;

  // --gutter untuk rel pil KabarListHeader di ponsel datang dari frame (= --edge-gutter).
  return (
    <div className={`${frame.frame} ${s.page}`} style={INFO_SEKOLAH_BRAND_VARS}>
      <div className={frame.inner}>
        <KabarListHeader
          title={T.pengajarTitle}
          lead={T.pengajarLead}
          searchLabel={T.pengajarSearchLabel}
          searchPlaceholder={T.pengajarSearchPlaceholder}
          kategoriLabel={T.jenjangFilterLabel}
          tabs={jenjangTabs(names, query, PENGAJAR_PATH)}
          search={query.search}
          onSearch={setSearch}
        />
        {/* key = query: tiap filter/halaman dimuat ulang dari awal, kepala (dan fokus kolom cari) tetap terpasang. */}
        <PengajarLoader key={queryKey} query={query} onPage={setPage} />
      </div>
    </div>
  );
}

function PengajarLoader({ query, onPage }: { query: InfoSekolahQuery; onPage: (page: number) => void }) {
  const { state, retry } = useLazyLoad(() => loadPengajarPage(query), true, "daftar pengajar");
  return <PengajarResults state={state} query={query} onRetry={retry} onPage={onPage} />;
}
