'use client';
import { IconChevronRight, IconMapPin } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { hasCoords, type Lokasi } from './bank-sampah.logic';
import { BANK_SAMPAH_TEXT as T } from './bank-sampah.text';
import x from './lokasi.module.css';
import { scrollRowIntoList } from '@/app/(public)/_com/map-list/list-scroll';
import type { MapSelection } from '@/app/(public)/_com/map-list/map-focus';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';

type Props = {
  items: readonly Lokasi[];
  selection: MapSelection | null;
  /** `null` = halaman tanpa peta: baris bukan tombol. */
  onPick: ((id: string) => void) | null;
  /** Buka modal detail (profil, struktur, dokumentasi) untuk satu lokasi. */
  onDetail: (item: Lokasi) => void;
};

/** Daftar lokasi bergaris; titik terpilih dari peta disorot dan digulir ke tampilan di dalam daftar yang bergulir. */
export function LokasiList({ items, selection, onPick, onDetail }: Props) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (selection?.source !== 'map') return;
    scrollRowIntoList(listRef.current, `[data-lokasi-id="${CSS.escape(selection.id)}"]`);
  }, [selection]);

  return (
    <ul ref={listRef} className={x.rows} aria-label={T.listLabel}>
      {items.map((item) => (
        <li key={item.id} data-lokasi-id={item.id}>
          <LokasiRow item={item} selected={selection?.id === item.id} onPick={onPick} onDetail={onDetail} />
        </li>
      ))}
    </ul>
  );
}

type RowProps = {
  item: Lokasi;
  selected: boolean;
  onPick: ((id: string) => void) | null;
  onDetail: (item: Lokasi) => void;
};

/**
 * Satu baris: nama + alamat (tombol "tampilkan di peta" bila berkoordinat dan peta ada), lalu aksi "Lihat detail ›"
 * (modal) dan "Petunjuk arah ›" di luar tombol pilih (tombol/tautan tidak boleh bersarang).
 */
export function LokasiRow({ item, selected, onPick, onDetail }: RowProps) {
  const mapped = hasCoords(item);
  const info = (
    <>
      <span className={x.name}>{item.name}</span>
      {item.alamat ? (
        <span className={x.alamat}>
          <IconMapPin size={15} stroke={1.75} aria-hidden className={x.alamatIcon} />
          <span>{item.alamat}</span>
        </span>
      ) : null}
      {onPick && !mapped ? <span className={x.kosong}>{T.notOnMap}</span> : null}
    </>
  );

  return (
    <div className={`${x.row} ${selected ? x.rowSelected : ''}`}>
      {onPick && mapped ? (
        <button type="button" className={x.pick} aria-pressed={selected} onClick={() => onPick(item.id)}>
          <span className={x.srOnly}>{T.showOnMap}</span>
          {info}
        </button>
      ) : (
        <div className={x.pick}>{info}</div>
      )}
      <div className={x.aksi}>
        <button
          type="button"
          className={`${x.arah} ${x.detail} ${r.trigger}`}
          onClick={() => onDetail(item)}
          aria-label={T.detailLabel(item.name)}
        >
          <span className={r.cta} data-text={T.detail}>
            {T.detail}
          </span>
          <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
        </button>
        {item.petunjukArah ? (
          <a
            className={`${x.arah} ${r.trigger}`}
            href={item.petunjukArah}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={T.petunjukArahLabel(item.name)}
          >
            <span className={r.cta} data-text={T.petunjukArah}>
              {T.petunjukArah}
            </span>
            <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
          </a>
        ) : null}
      </div>
    </div>
  );
}
