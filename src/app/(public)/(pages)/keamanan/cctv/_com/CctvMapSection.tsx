'use client';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { MAP_FIT_MAX_ZOOM, MAP_FOCUS_ZOOM, STATUS_META, type CctvStatusKey } from "./cctv.meta";
import type { CctvItem } from "./cctv.source";
import { CCTV_TEXT as T, STATUS_LABEL } from "./cctv.text";
import x from "./cctv-explorer.module.css";

/** Titik terpilih + asalnya; `n` naik tiap pilihan agar memilih titik yang sama dua kali tetap memfokuskan peta. */
export type Selection = { id: string; source: "list" | "map"; n: number };

type MappedItem = CctvItem & { latitude: number; longitude: number };
type Props = { items: readonly MappedItem[]; selection: Selection | null; onSelect: (id: string | null) => void };

/** Peta Leaflet titik CCTV: warna penanda = status; penanda terpilih membesar dan berada di atas penanda lain. */
export default function CctvMapSection({ items, selection, onSelect }: Props) {
  const markers = useRef(new Map<string, L.Marker>());
  const selectedId = useRef<string | null>(null);
  selectedId.current = selection?.id ?? null;

  // Batas awal dihitung sekali (MapContainer hanya membaca properti awal); saringan cari tidak menggeser peta.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- sengaja hanya saat mount
  const view = useMemo(() => initialView(items), []);

  return (
    <MapContainer {...view} scrollWheelZoom={false} className={x.map} aria-label={T.mapLabel}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map((item) => {
        const selected = item.id === selection?.id;
        return (
          <Marker
            key={item.id}
            ref={(marker) => {
              if (marker) markers.current.set(item.id, marker);
              else markers.current.delete(item.id);
            }}
            position={[item.latitude, item.longitude]}
            icon={markerIcon(item.status, selected)}
            zIndexOffset={selected ? 1000 : 0}
            title={`${item.nama || item.kode}, ${STATUS_LABEL[item.status]}`}
            eventHandlers={{
              // Ref diperbarui langsung: klik titik lain menutup popup lama sebelum render berikutnya.
              click: () => {
                selectedId.current = item.id;
                onSelect(item.id);
              },
              // Popup lain dibuka menutup popup ini; hanya batalkan pilihan bila popup titik terpilih yang ditutup.
              popupclose: () => {
                if (selectedId.current === item.id) onSelect(null);
              },
            }}
          >
            <Popup>
              <CctvPopup item={item} />
            </Popup>
          </Marker>
        );
      })}
      <FocusOnSelect selection={selection} items={items} markers={markers} />
    </MapContainer>
  );
}

/** Pilihan dari daftar → terbang ke titik (langsung bila reduced motion) lalu buka popup-nya. */
function FocusOnSelect({ selection, items, markers }: { selection: Selection | null; items: readonly MappedItem[]; markers: { current: Map<string, L.Marker> } }) {
  const map = useMap();
  useEffect(() => {
    if (selection?.source !== "list") return;
    const item = items.find((i) => i.id === selection.id);
    if (!item) return;
    const target = L.latLng(item.latitude, item.longitude);
    const zoom = Math.max(map.getZoom(), MAP_FOCUS_ZOOM);
    const open = () => markers.current.get(item.id)?.openPopup();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      map.setView(target, zoom);
      open();
      return;
    }
    map.once("moveend", open);
    map.flyTo(target, zoom, { duration: 0.6 });
    // Pilihan baru sebelum terbang selesai: batalkan pembukaan popup titik lama.
    return () => {
      map.off("moveend", open);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pemicu = pilihan baru (n), bukan perubahan saringan
  }, [selection?.n]);
  return null;
}

/** Isi popup penanda; span (bukan p) karena CSS Leaflet memberi margin besar pada p di dalam popup. */
function CctvPopup({ item }: { item: CctvItem }) {
  return (
    <span className={x.popup}>
      <span className={x.popupKode}>{item.kode}</span>
      <span className={x.popupName}>{item.nama || item.kode}</span>
      {item.lokasi ? <span className={x.popupLokasi}>{item.lokasi}</span> : null}
      <span className={x.popupStatus} style={{ color: STATUS_META[item.status].accent }}>
        {STATUS_LABEL[item.status]}
      </span>
    </span>
  );
}

/** Satu titik → pusat + zoom tetap; banyak titik → batas yang memuat semuanya. */
function initialView(items: readonly MappedItem[]) {
  if (items.length === 1) {
    return { center: L.latLng(items[0].latitude, items[0].longitude), zoom: MAP_FIT_MAX_ZOOM };
  }
  const bounds = L.latLngBounds(items.map((i) => L.latLng(i.latitude, i.longitude)));
  return { bounds, boundsOptions: { padding: L.point(40, 40), maxZoom: MAP_FIT_MAX_ZOOM } };
}

const iconCache = new Map<string, L.DivIcon>();

/** Bulatan berwarna status (18px; terpilih 26px + cincin brand). Ikon di-cache agar Leaflet tak membuat ulang DOM. */
function markerIcon(status: CctvStatusKey, selected: boolean): L.DivIcon {
  const key = `${status}-${selected}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const size = selected ? 26 : 18;
  const icon = L.divIcon({
    className: `${x.marker} ${selected ? x.markerSelected : ""}`,
    html: `<span style="--accent:${STATUS_META[status].accent}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
  iconCache.set(key, icon);
  return icon;
}
