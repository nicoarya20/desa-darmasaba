'use client';
import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { LayananSearch } from "@/app/(public)/(pages)/pemerintahan/layanan/_com/LayananSearch";
import { filterByName } from "@/app/(public)/(pages)/pemerintahan/layanan/_com/layanan.logic";
import { useMemo, useState } from "react";
import s from "./posyandu.module.css";
import type { PosyanduItem } from "./posyandu.source";
import { POSYANDU_TEXT as T } from "./posyandu.text";
import { PosyanduRow } from "./PosyanduRow";
import { PosyanduEmpty, PosyanduNotice, PosyanduSkeleton } from "./PosyanduStates";
import type { LoadState } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import r from "./posyandu-rows.module.css";

const TITLE_ID = "posyandu-daftar-title";
const SKELETON_ROWS = 5;

/** Tab Data Posyandu: direktori berbentuk baris (nama, banjar, jadwal, telepon), disaring nama di klien. */
export function PosyanduDirectory({ state, onRetry }: { state: LoadState<PosyanduItem[]>; onRetry: () => void }) {
  const [query, setQuery] = useState("");
  const items = useMemo(() => (state.status === "ready" ? sortByName(state.data) : []), [state]);
  const shown = useMemo(() => filterByName(items, query), [items, query]);

  return (
    <section className={apb.panel} aria-labelledby={TITLE_ID}>
      <div className={s.panelHead}>
        <div>
          <h2 id={TITLE_ID} className={apb.panelTitle}>
            {T.directoryTitle}
          </h2>
          {state.status === "ready" && items.length > 0 ? <p className={s.panelLead}>{T.directoryLead(items.length)}</p> : null}
        </div>
        {state.status === "ready" && items.length > 0 ? (
          <div className={s.searchOnTile}>
            <LayananSearch value={query} onChange={setQuery} label={T.searchLabel} placeholder={T.searchPlaceholder} />
          </div>
        ) : null}
      </div>
      {state.status === "error" ? (
        <PosyanduNotice message={T.directoryFailed} onRetry={onRetry} />
      ) : state.status !== "ready" ? (
        <PosyanduSkeleton label={T.directoryLoading} count={SKELETON_ROWS} height={88} />
      ) : items.length === 0 ? (
        <PosyanduEmpty message={T.directoryEmpty} />
      ) : shown.length === 0 ? (
        <PosyanduEmpty message={T.directoryNoMatch(query.trim())} />
      ) : (
        <PosyanduRows items={shown} />
      )}
    </section>
  );
}

/** Baris posyandu bergaris pemisah (pola panel Pengumuman/Monev). */
export function PosyanduRows({ items }: { items: readonly PosyanduItem[] }) {
  return (
    <ul className={r.rows}>
      {items.map((item) => (
        <PosyanduRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

function sortByName(items: readonly PosyanduItem[]): PosyanduItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "id", { sensitivity: "base" }));
}
