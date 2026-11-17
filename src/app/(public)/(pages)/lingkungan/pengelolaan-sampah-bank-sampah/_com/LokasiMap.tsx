'use client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { FocusOnSelect, type MapSelection } from '@/app/(public)/_com/map-list/map-focus';
import { useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { MappedLokasi } from './bank-sampah.logic';
import { MAP_FIT_MAX_ZOOM, MAP_FOCUS_ZOOM } from './bank-sampah.meta';
import { BANK_SAMPAH_TEXT as T } from './bank-sampah.text';
import x from './lokasi.module.css';

/** Popup selebar ini + jarak kiri tombol zoom tetap muat di peta ponsel 342px tanpa menutupi tombol zoom. */
const POPUP_MAX_WIDTH = 240;
const POPUP_PAD_TOP_LEFT: [number, number] = [52, 12];

type Props = { items: readonly MappedLokasi[]; selection: MapSelection | null; onSelect: (id: string | null) => void };

/** Peta Leaflet publik lokasi Bank Sampah: penanda bulat brand; penanda terpilih membesar dan berada di atas. */
export default function LokasiMap({ items, selection, onSelect }: Props) {
  const markers = useRef(new Map<string, L.Marker>());
  const selectedId = useRef<string | null>(null);
  selectedId.current = selection?.id ?? null;

  // Batas awal dihitung sekali (MapContainer hanya membaca properti awal); saringan cari tidak menggeser peta.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- sengaja hanya saat mount
  const view = useMemo(() => initialView(items), []);
  const focused = items.find((item) => item.id === selection?.id);

  return (
    <MapContainer {...view} scrollWheelZoom={false} className={x.mapFill} aria-label={T.mapLabel}>
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
            position={[item.lat, item.lng]}
            icon={markerIcon(selected)}
            zIndexOffset={selected ? 1000 : 0}
            title={item.name}
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
            <Popup maxWidth={POPUP_MAX_WIDTH} autoPanPaddingTopLeft={POPUP_PAD_TOP_LEFT}>
              <LokasiPopup item={item} />
            </Popup>
          </Marker>
        );
      })}
      <FocusOnSelect
        selection={selection}
        position={focused ? [focused.lat, focused.lng] : null}
        markers={markers}
        zoom={MAP_FOCUS_ZOOM}
      />
    </MapContainer>
  );
}

/** Isi popup; span (bukan p) karena CSS Leaflet memberi margin besar pada p di dalam popup. */
function LokasiPopup({ item }: { item: MappedLokasi }) {
  return (
    <span className={x.popup}>
      <span className={x.popupName}>{item.name}</span>
      {item.alamat ? <span className={x.popupAlamat}>{item.alamat}</span> : null}
      {item.petunjukArah ? (
        <a
          className={`${x.popupArah} ${r.trigger}`}
          href={item.petunjukArah}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={T.petunjukArahLabel(item.name)}
        >
          <span className={r.cta} data-text={T.petunjukArah}>
            {T.petunjukArah}
          </span>
          <span className={r.chevron} aria-hidden>
            ›
          </span>
        </a>
      ) : null}
    </span>
  );
}

/** Satu titik → pusat + zoom tetap; banyak titik → batas yang memuat semuanya. */
function initialView(items: readonly MappedLokasi[]) {
  if (items.length === 1) {
    return { center: L.latLng(items[0].lat, items[0].lng), zoom: MAP_FIT_MAX_ZOOM };
  }
  const bounds = L.latLngBounds(items.map((i) => L.latLng(i.lat, i.lng)));
  return { bounds, boundsOptions: { padding: L.point(40, 40), maxZoom: MAP_FIT_MAX_ZOOM } };
}

const iconCache = new Map<boolean, L.DivIcon>();

/** Bulatan brand (18px; terpilih 26px + cincin). Ikon di-cache agar Leaflet tak membuat ulang DOM. */
function markerIcon(selected: boolean): L.DivIcon {
  const cached = iconCache.get(selected);
  if (cached) return cached;
  const size = selected ? 26 : 18;
  const icon = L.divIcon({
    className: `${x.marker} ${selected ? x.markerSelected : ''}`,
    html: '<span></span>',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
  iconCache.set(selected, icon);
  return icon;
}
