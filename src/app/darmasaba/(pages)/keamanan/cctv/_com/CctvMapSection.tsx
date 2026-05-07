'use client'
import { CctvData } from '@/app/admin/(dashboard)/_state/keamanan/cctv';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

type Props = {
  data: CctvData[];
};

function createCctvIcon(status: 'Online' | 'Offline') {
  const color = status === 'Online' ? '#2f9e44' : '#e03131';
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      border:2.5px solid white;
      border-radius:50%;
      width:18px;height:18px;
      box-shadow:0 1px 5px rgba(0,0,0,0.45);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

export default function CctvMapSection({ data }: Props) {
  const markers = data.filter((c) => c.latitude != null && c.longitude != null);
  if (markers.length === 0) return null;

  const center: [number, number] = [
    markers.reduce((s, m) => s + m.latitude!, 0) / markers.length,
    markers.reduce((s, m) => s + m.longitude!, 0) / markers.length,
  ];

  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((cctv) => (
        <Marker
          key={cctv.id}
          position={[cctv.latitude!, cctv.longitude!]}
          icon={createCctvIcon(cctv.status)}
        >
          <Popup>
            <div style={{ padding: '2px 4px', minWidth: 160 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <strong style={{ fontSize: 13 }}>{cctv.kode}</strong>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: cctv.status === 'Online' ? '#2f9e44' : '#e03131',
                    background: cctv.status === 'Online' ? '#d3f9d8' : '#ffe3e3',
                    borderRadius: 4,
                    padding: '1px 6px',
                  }}
                >
                  {cctv.status}
                </span>
              </div>
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{cctv.nama}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{cctv.lokasi}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
