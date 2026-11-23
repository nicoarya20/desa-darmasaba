'use client';
import { IconMapPin } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { formatLastActive, hasCoords } from "./cctv.logic";
import { CCTV_TAMPIL_AKTIF_TERAKHIR, CCTV_TAMPIL_DESKRIPSI, statusVars, type CctvStatusKey } from "./cctv.meta";
import type { CctvItem } from "./cctv.source";
import { CCTV_TEXT as T, STATUS_LABEL } from "./cctv.text";
import x from "./cctv-explorer.module.css";
import type { MapSelection } from "@/app/(public)/_com/map-list/map-focus";
import { scrollRowIntoList } from "@/app/(public)/_com/map-list/list-scroll";

type Props = { items: readonly CctvItem[]; selection: MapSelection | null; onPick: (id: string) => void };

/** Daftar CCTV ringkas; titik terpilih dari peta disorot dan digulir ke tampilan di dalam daftar yang bergulir. */
export function CctvList({ items, selection, onPick }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  // "Sekarang" dibekukan saat mount: waktu relatif dihitung di peramban (data dimuat di klien, tanpa beda hidrasi).
  const [now] = useState(() => new Date());

  useEffect(() => {
    if (selection?.source !== "map") return;
    scrollRowIntoList(listRef.current, `[data-cctv-id="${CSS.escape(selection.id)}"]`);
  }, [selection]);

  return (
    <ul ref={listRef} className={x.rows} aria-label={T.listLabel}>
      {items.map((item) => (
        <li key={item.id} data-cctv-id={item.id}>
          <CctvRow item={item} now={now} selected={selection?.id === item.id} onPick={onPick} />
        </li>
      ))}
    </ul>
  );
}

type RowProps = { item: CctvItem; now: Date; selected: boolean; onPick: (id: string) => void };

/** Satu baris: [nama] + status (titik warna) · lokasi · kode [dan aktif terakhir]. Nama dan aktif terakhir hanya bila ditampilkan dan terisi. */
export function CctvRow({ item, now, selected, onPick }: RowProps) {
  const mapped = hasCoords(item);
  const last = CCTV_TAMPIL_AKTIF_TERAKHIR ? formatLastActive(item.lastActive, now) : null;
  const content = (
    <>
      <span className={x.top}>
        {CCTV_TAMPIL_DESKRIPSI && item.nama ? <span className={x.name}>{item.nama}</span> : null}
        <StatusLabel status={item.status} />
      </span>
      <span className={`${x.lokasi} ${item.lokasi ? "" : x.kosong}`}>
        <IconMapPin size={15} stroke={1.75} aria-hidden className={x.lokasiIcon} />
        <span>{item.lokasi || T.lokasiKosong}</span>
      </span>
      <span className={x.meta}>
        {item.kode ? <span className={x.kode}>{item.kode}</span> : null}
        {last ? (
          <span>
            {T.lastActive}{" "}
            <time dateTime={last.dateTime} title={last.full}>
              {last.text}
            </time>
          </span>
        ) : null}
        {mapped ? null : <span className={x.kosong}>{T.notOnMap}</span>}
      </span>
    </>
  );

  if (!mapped) return <div className={`${x.row} ${x.rowStatic}`}>{content}</div>;
  return (
    <button type="button" className={x.row} aria-pressed={selected} onClick={() => onPick(item.id)}>
      <span className={x.srOnly}>{T.showOnMap}</span>
      {content}
    </button>
  );
}

function StatusLabel({ status }: { status: CctvStatusKey }) {
  return (
    <span className={x.status} style={statusVars(status)}>
      <span className={x.dot} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
