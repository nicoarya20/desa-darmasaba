'use client';
import { LayananSearch } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/LayananSearch';
import { listSearchable } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import { filterLokasi, hasCoords, type Lokasi } from './bank-sampah.logic';
import s from './bank-sampah.module.css';
import { BANK_SAMPAH_TEXT as T } from './bank-sampah.text';
import x from './lokasi.module.css';
import { LokasiList } from './LokasiList';
import BankSampahDetailModal from './bank-sampah.detail-modal';
import { revealMap } from '@/app/(public)/_com/map-list/list-scroll';
import type { MapSelection } from '@/app/(public)/_com/map-list/map-focus';

// Leaflet butuh `window`: peta hanya dirender di peramban.
const LokasiMap = dynamic(() => import('./LokasiMap'), {
  ssr: false,
  loading: () => <div className={`${x.mapFill} ${kabar.placeholder}`} aria-busy="true" aria-label={T.mapLoading} />,
});

const TITLE_ID = 'bank-sampah-lokasi-title';

/** Bagian "Lokasi Bank Sampah": judul selalu tampil; isi = daftar + peta, kerangka berdenyut, atau kotak kosong/galat. */
export function LokasiBankSampah({ state }: { state: LoadState<Lokasi[]> }) {
  const mapped = state.status === 'ready' && state.data.some(hasCoords);
  return (
    <section className={s.block} aria-labelledby={TITLE_ID}>
      <div className={x.head}>
        <h2 id={TITLE_ID} className={s.blockTitle}>
          {T.lokasiTitle}
        </h2>
        {mapped ? <p className={x.lead}>{T.lokasiLead}</p> : null}
      </div>
      {state.status === 'loading' ? (
        <div className={x.explorer} aria-busy="true" aria-label={T.lokasiLoading}>
          <div className={`${x.side} ${x.sidePlaceholder} ${kabar.placeholder}`} aria-hidden />
          <div className={`${x.mapFrame} ${kabar.placeholder}`} aria-hidden />
        </div>
      ) : state.status === 'error' || state.data.length === 0 ? (
        <p className={kabar.empty}>{state.status === 'error' ? T.lokasiError : T.lokasiEmpty}</p>
      ) : (
        <LokasiExplorer items={state.data} mapped={mapped} />
      )}
    </section>
  );
}

/**
 * Daftar + peta. Pilih baris → peta terbang ke titik dan membuka popup; klik penanda → baris tersorot;
 * "Lihat detail" → modal bertab Profil / Struktur / Dokumentasi.
 * Kata kunci menyaring daftar dan penanda sekaligus. Tanpa satu pun koordinat → peta tidak dirender, daftar selebar penuh.
 */
function LokasiExplorer({ items, mapped }: { items: readonly Lokasi[]; mapped: boolean }) {
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<MapSelection | null>(null);
  const [detail, setDetail] = useState<Lokasi | null>(null);
  const counter = useRef(0);
  const mapRef = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => filterLokasi(items, query), [items, query]);
  const markers = useMemo(() => shown.filter(hasCoords), [shown]);
  // Titik terpilih yang tersaring keluar tidak lagi dianggap terpilih.
  const active = selection && shown.some((item) => item.id === selection.id) ? selection : null;

  const select = (id: string | null, source: MapSelection['source']) => {
    counter.current += 1;
    setSelection(id ? { id, source, n: counter.current } : null);
  };

  const pickFromList = (id: string) => {
    select(id, 'list');
    revealMap(mapRef.current);
  };

  return (
    <div className={`${x.explorer} ${mapped ? '' : x.noMap}`}>
      <div className={x.side}>
        {listSearchable(query.trim(), items.length) ? (
          // Pembungkus flex:none: .search Layanan ber-flex-basis 320px, di kolom flex itu menjadi tinggi.
          <div className={x.search}>
            <LayananSearch value={query} onChange={setQuery} label={T.searchLabel} placeholder={T.searchPlaceholder} />
          </div>
        ) : null}
        {shown.length === 0 ? (
          <p className={x.noMatch}>{T.lokasiNoMatch(query.trim())}</p>
        ) : (
          <LokasiList items={shown} selection={active} onPick={mapped ? pickFromList : null} onDetail={setDetail} />
        )}
      </div>
      {mapped ? (
        <div ref={mapRef} className={x.mapFrame}>
          <LokasiMap items={markers} selection={active} onSelect={(id) => select(id, 'map')} />
        </div>
      ) : null}
      {/* Modal (Mantine) hanya dipasang saat dibuka: detail di-fetch per buka, tanpa beban di render awal. */}
      {detail ? <BankSampahDetailModal id={detail.id} nama={detail.name} onClose={() => setDetail(null)} /> : null}
    </div>
  );
}
