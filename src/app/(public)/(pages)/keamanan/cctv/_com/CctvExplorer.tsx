'use client';
import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { LayananSearch } from "@/app/(public)/(pages)/pemerintahan/layanan/_com/LayananSearch";
import { Skeleton } from "@mantine/core";
import { IconMapPinOff } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { filterCctv, hasCoords, summarizeCctv } from "./cctv.logic";
import { CCTV_SEARCH_THRESHOLD, statusVars, type CctvStatusKey } from "./cctv.meta";
import type { CctvItem } from "./cctv.source";
import { CCTV_TEXT as T, STATUS_LABEL } from "./cctv.text";
import x from "./cctv-explorer.module.css";
import { CctvList } from "./CctvList";
import type { Selection } from "./CctvMapSection";

// Leaflet butuh `window`: peta hanya dirender di peramban.
const CctvMapSection = dynamic(() => import("./CctvMapSection"), {
  ssr: false,
  loading: () => <Skeleton className={x.mapSkeleton} radius={14} aria-label={T.mapLoading} />,
});

const TITLE_ID = "cctv-peta-title";

/**
 * Panel peta + daftar. Pilih baris → peta terbang ke titik dan membuka popup; klik penanda → baris tersorot
 * (dan digulir ke tampilan bila daftar bergulir sendiri). Kata kunci cari menyaring daftar dan penanda sekaligus.
 */
export function CctvExplorer({ items }: { items: readonly CctvItem[] }) {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const counter = useRef(0);
  const mapRef = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => filterCctv(items, query), [items, query]);
  const markers = useMemo(() => shown.filter(hasCoords), [shown]);
  const mappedTotal = useMemo(() => summarizeCctv(items).mapped, [items]);
  const statuses = useMemo(() => legendStatuses(items), [items]);
  // Titik terpilih yang tersaring keluar tidak lagi dianggap terpilih.
  const active = selection && shown.some((item) => item.id === selection.id) ? selection : null;

  const select = (id: string | null, source: Selection["source"]) => {
    counter.current += 1;
    setSelection(id ? { id, source, n: counter.current } : null);
  };

  const pickFromList = (id: string) => {
    select(id, "list");
    revealMap(mapRef.current);
  };

  return (
    <section className={apb.panel} aria-labelledby={TITLE_ID}>
      <div className={x.head}>
        <div>
          <h2 id={TITLE_ID} className={apb.panelTitle}>
            {T.panelTitle}
          </h2>
          {mappedTotal > 0 ? <p className={x.lead}>{T.panelLead}</p> : null}
        </div>
        <ul className={x.legend} aria-label={T.legendLabel}>
          {statuses.map((key) => (
            <li key={key} className={x.legendItem} style={statusVars(key)}>
              <span className={x.dot} aria-hidden />
              {STATUS_LABEL[key]}
            </li>
          ))}
        </ul>
      </div>

      <div className={`${x.explorer} ${mappedTotal > 0 ? "" : x.noMap}`}>
        <div ref={mapRef} className={x.mapFrame}>
          {mappedTotal > 0 ? (
            <CctvMapSection items={markers} selection={active} onSelect={(id) => select(id, "map")} />
          ) : (
            <div className={x.mapEmpty}>
              <IconMapPinOff size={28} stroke={1.5} aria-hidden />
              <p>{T.mapEmpty}</p>
            </div>
          )}
        </div>
        <div className={x.side}>
          {items.length > CCTV_SEARCH_THRESHOLD ? (
            <div className={x.search}>
              <LayananSearch value={query} onChange={setQuery} label={T.searchLabel} placeholder={T.searchPlaceholder} />
            </div>
          ) : null}
          {shown.length === 0 ? (
            <p className={x.noMatch}>{T.noMatch(query.trim())}</p>
          ) : (
            <CctvList items={shown} selection={active} onPick={pickFromList} />
          )}
        </div>
      </div>
    </section>
  );
}

/** Legenda: Online & Offline selalu; "Status belum diisi" hanya bila ada titik semacam itu. */
function legendStatuses(items: readonly CctvItem[]): CctvStatusKey[] {
  const keys: CctvStatusKey[] = ["online", "offline"];
  return items.some((item) => item.status === "unknown") ? [...keys, "unknown"] : keys;
}

/** Saat peta dan daftar bertumpuk (tablet/ponsel), gulir peta ke tampilan bila sebagian tertutup. */
function revealMap(el: HTMLElement | null) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const navbar = 64;
  if (rect.top >= navbar && rect.bottom <= window.innerHeight) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
