import { KabarListPagination } from "@/app/(public)/_com/kabar-list/KabarListPagination";
import type { LoadState } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import { IconChalkboard } from "@tabler/icons-react";
import { InfoSekolahEmpty, InfoSekolahNotice, InfoSekolahSkeleton } from "./InfoSekolahStates";
import { emptyMessage, type InfoSekolahQuery } from "./info-sekolah.logic";
import { jenjangAccent } from "./info-sekolah.meta";
import type { PengajarItem, PengajarPage } from "./info-sekolah.source";
import { INFO_SEKOLAH_TEXT as T } from "./info-sekolah.text";
import p from "./pengajar.module.css";

const SKELETON_ROWS = 6;
const LIST_TITLE_ID = "pengajar-list-title";

type Props = {
  state: LoadState<PengajarPage>;
  query: InfoSekolahQuery;
  onRetry: () => void;
  onPage: (page: number) => void;
};

/** Isi daftar pengajar untuk satu keadaan muat: kerangka, galat, kosong, atau baris + paginasi. */
export function PengajarResults({ state, query, onRetry, onPage }: Props) {
  return (
    <section aria-labelledby={LIST_TITLE_ID}>
      <h2 id={LIST_TITLE_ID} className={p.srOnly}>
        {T.pengajarListLabel}
      </h2>
      <PengajarContent state={state} query={query} onRetry={onRetry} onPage={onPage} />
    </section>
  );
}

function PengajarContent({ state, query, onRetry, onPage }: Props) {
  if (state.status === "error") return <InfoSekolahNotice message={T.pengajarFailed} onRetry={onRetry} />;
  if (state.status !== "ready") return <InfoSekolahSkeleton label={T.pengajarLoading} count={SKELETON_ROWS} height={64} />;
  const { items, total, totalPages } = state.data;
  if (items.length === 0) {
    // Ada data tapi halaman di URL melewati halaman terakhir (mis. tautan lama) → arahkan ke halaman 1.
    if (total > 0) {
      return <InfoSekolahEmpty message={T.pageOutOfRange(query.page)} action={{ label: T.firstPage, onClick: () => onPage(1) }} />;
    }
    return <InfoSekolahEmpty message={emptyMessage(T.pengajarNoun, query)} />;
  }
  return (
    <>
      <p className={p.count} aria-live="polite">
        <strong>{T.pengajarCount(total)}</strong>
      </p>
      <ul className={p.rows}>
        {items.map((item) => (
          <PengajarRow key={item.id} item={item} />
        ))}
      </ul>
      <KabarListPagination total={totalPages} value={query.page} label={T.paginationLabel} onChange={onPage} />
    </>
  );
}

function PengajarRow({ item }: { item: PengajarItem }) {
  const jenjang = item.lembaga?.jenjangPendidikan?.nama ?? null;
  return (
    <li className={p.row}>
      <span className={p.avatar} aria-hidden>
        <IconChalkboard size={20} stroke={1.75} />
      </span>
      <div className={p.main}>
        <p className={p.name}>{item.nama}</p>
        {item.lembaga ? <p className={p.meta}>{item.lembaga.nama}</p> : null}
      </div>
      {jenjang ? (
        <span className={p.jenjang} style={jenjangAccent(jenjang)}>
          <span className={p.dot} aria-hidden />
          {jenjang}
        </span>
      ) : null}
    </li>
  );
}
