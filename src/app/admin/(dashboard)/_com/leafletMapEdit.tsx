/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L, { LeafletMouseEvent } from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type Props = {
  initialPosition: { lat: number; lng: number };
  onChange: (pos: { lat: number; lng: number }) => void;
};

export default function LeafletMapEdit({ initialPosition, onChange }: Props) {
  const [markerPos, setMarkerPos] = useState(initialPosition);

  useEffect(() => {
    setMarkerPos(initialPosition);
  }, [initialPosition]);

  function LocationMarker() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const { lat, lng } = e.latlng;
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
    </MapContainer>
  );
}
