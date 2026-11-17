/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useState, useEffect, useRef, type RefObject } from 'react';
import 'leaflet/dist/leaflet.css';
import L, { LeafletMouseEvent } from 'leaflet';

type Posisi = { lat: number; lng: number };

type Fokus = Posisi & { zoom: number; id: number };

type Props = {
  initialPosition: Posisi;
  onChange: (pos: Posisi) => void;
  /** Geser tampilan peta tanpa memilih titik; `id` baru = geser lagi meski posisinya sama. */
  fokus?: Fokus;
};

/** Geser peta saat posisi diubah dari luar (cari/ketik koordinat); posisi hasil klik admin sendiri dilewati. */
function IkutiPosisi({ lat, lng, posisiKlik }: Posisi & { posisiKlik: RefObject<Posisi | null> }) {
  const map = useMap();
  useEffect(() => {
    const klik = posisiKlik.current;
    posisiKlik.current = null;
    if (klik && klik.lat === lat && klik.lng === lng) return;
    map.setView([lat, lng], map.getZoom());
  }, [map, lat, lng, posisiKlik]);
  return null;
}

function GeserFokus({ lat, lng, zoom, id }: Fokus) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [map, lat, lng, zoom, id]);
  return null;
}

export default function LeafletMapEdit({ initialPosition, onChange, fokus }: Props) {
  const [markerPos, setMarkerPos] = useState(initialPosition);
  const posisiKlik = useRef<Posisi | null>(null);
  const { lat, lng } = initialPosition;

  // ✅ Pastikan icon config cuma jalan di client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  useEffect(() => {
    setMarkerPos({ lat, lng });
  }, [lat, lng]);

  function LocationMarker() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const { lat, lng } = e.latlng;
        posisiKlik.current = { lat, lng };
        setMarkerPos({ lat, lng });
        onChange({ lat, lng });
      },
    });

    return <Marker position={markerPos} />;
  }

  return (
    <MapContainer
      center={markerPos}
      zoom={16}
      scrollWheelZoom
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <LocationMarker />
      <IkutiPosisi lat={lat} lng={lng} posisiKlik={posisiKlik} />
      {fokus && <GeserFokus {...fokus} />}
    </MapContainer>
  );
}
