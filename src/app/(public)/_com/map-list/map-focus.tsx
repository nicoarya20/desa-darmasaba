'use client';
import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Titik terpilih pada panel daftar + peta, beserta asalnya. `n` naik tiap pilihan agar memilih titik yang sama dua kali
 * tetap memfokuskan peta. Modul ini memuat Leaflet: dari luar komponen peta (yang dimuat `dynamic` ssr:false) cukup
 * `import type`.
 */
export type MapSelection = { id: string; source: 'list' | 'map'; n: number };

type Props = {
  selection: MapSelection | null;
  /** Koordinat titik terpilih (`null` bila tersaring keluar/tanpa koordinat). */
  position: readonly [number, number] | null;
  markers: { readonly current: ReadonlyMap<string, L.Marker> };
  /** Zoom minimum saat terbang ke titik (zoom saat ini dipertahankan bila sudah lebih dekat). */
  zoom: number;
};

/** Pilihan dari daftar → terbang ke titik (langsung bila reduced motion) lalu buka popup-nya. Dirender di dalam MapContainer. */
export function FocusOnSelect({ selection, position, markers, zoom }: Props) {
  const map = useMap();
  useEffect(() => {
    if (selection?.source !== 'list' || !position) return;
    const id = selection.id;
    const target = L.latLng(position[0], position[1]);
    const nextZoom = Math.max(map.getZoom(), zoom);
    const open = () => markers.current.get(id)?.openPopup();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      map.setView(target, nextZoom);
      open();
      return;
    }
    map.once('moveend', open);
    map.flyTo(target, nextZoom, { duration: 0.6 });
    // Pilihan baru sebelum terbang selesai: batalkan pembukaan popup titik lama.
    return () => {
      map.off('moveend', open);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pemicu = pilihan baru (n), bukan perubahan saringan
  }, [selection?.n]);
  return null;
}
