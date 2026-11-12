'use client';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import { useEffect, useMemo, useState } from 'react';
import { useSnapshot } from 'valtio';
import { LayananSearch } from './LayananSearch';
import { LayananSection } from './LayananSection';
import { SuratKeteranganCard } from './SuratKeteranganCard';
import { filterByName, type SuratKeteranganItem } from './layanan.logic';
import { LAYANAN_LIST_LIMIT } from './layanan.meta';
import page from './layanan.module.css';
import s from './layanan-surat.module.css';
import { LAYANAN_TEXT } from './layanan.text';

const T = LAYANAN_TEXT.surat;
const PLACEHOLDER_COUNT = 6;

/** Bagian Surat Keterangan: semua layanan dimuat sekaligus, disaring di klien lewat kolom cari. */
function PelayananSuratKeterangan() {
  const snap = useSnapshot(stateLayananDesa.suratKeterangan.findMany);
  const [query, setQuery] = useState('');

  useEffect(() => {
    void stateLayananDesa.suratKeterangan.findMany.load(1, LAYANAN_LIST_LIMIT);
  }, []);

  // data null = belum pernah dimuat; data lama (mis. 10 item dari galeri beranda) disembunyikan selama memuat.
  const loading = snap.loading || snap.data === null;
  const items = useMemo(() => (snap.data ?? []) as SuratKeteranganItem[], [snap.data]);
  const visible = useMemo(() => filterByName(items, query), [items, query]);

  return (
    <LayananSection
      title={T.title}
      lead={T.lead}
      aside={<LayananSearch value={query} onChange={setQuery} label={T.searchLabel} placeholder={T.searchPlaceholder} />}
    >
      {loading ? (
        <ul className={s.grid} aria-busy="true" aria-label={T.loading}>
          {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
            <li key={i} aria-hidden>
              <span className={s.placeholder} />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className={page.empty}>{T.empty}</p>
      ) : visible.length === 0 ? (
        <p className={page.empty} role="status">
          {T.noMatch(query.trim())}
        </p>
      ) : (
        <ul className={s.grid} aria-label={T.gridLabel}>
          {visible.map((item) => (
            <li key={item.id}>
              <SuratKeteranganCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </LayananSection>
  );
}

export default PelayananSuratKeterangan;
