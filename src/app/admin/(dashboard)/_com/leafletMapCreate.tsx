/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L, { type LeafletMouseEvent } from 'leaflet';

type Props = {
  defaultCenter: { lat: number; lng: number };
  onSelect?: (pos: { lat: number; lng: number }) => void;
  readOnly?: boolean;
};

export default function LeafletMap({ defaultCenter, onSelect, readOnly = false }: Props) {
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  useEffect(() => {
    // Aman di sini, karena ini hanya jalan di client
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  function LocationMarker() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        if (readOnly) return;

        const { lat, lng } = e.latlng;
        setMarkerPos({ lat, lng });
        onSelect?.({ lat, lng });
      },
    });

    return <Marker position={markerPos} />;
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={16}
      scrollWheelZoom
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <LocationMarker />
    </MapContainer>
  );
}
