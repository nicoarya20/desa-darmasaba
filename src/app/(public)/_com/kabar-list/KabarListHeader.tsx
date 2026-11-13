'use client';
import { IconSearch } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import BackButton from '../../(pages)/pemerintahan/layanan/_com/BackButto';
import { SEARCH_DEBOUNCE_MS } from './kabar-list.meta';
import s from './kabar-list.module.css';

/** Satu pil kategori (tautan). `key` stabil dipakai juga untuk mendeteksi pindah kategori. */
export type KabarListTab = { key: string; href: string; label: string; active: boolean };

type Props = {
  title: string;
  lead: string;
  searchLabel: string;
  searchPlaceholder: string;
  kategoriLabel: string;
  tabs: readonly KabarListTab[];
  /** Kata kunci yang sedang aktif di URL (`?search=`). */
  search: string;
  /** Kirim kata kunci baru ke URL (dipanggil setelah jeda ketik atau Enter). */
  onSearch: (next: string) => void;
  /** `false` → kolom cari tidak dirender (daftar pendek); bawaan `true`. */
  searchable?: boolean;
};

/**
 * Kepala halaman daftar Kabar: kembali, judul + pengantar, kolom cari (kecuali `searchable=false`), lalu pil kategori
 * (tautan; tidak dirender bila `tabs` kosong).
 */
export function KabarListHeader({
  title,
  lead,
  searchLabel,
  searchPlaceholder,
  kategoriLabel,
  tabs,
  search,
  onSearch,
  searchable = true,
}: Props) {
  const searchId = useId();
  const [value, setValue] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  const timer = useRef<number | null>(null);
  const pillsRef = useRef<HTMLElement>(null);
  const activeKey = tabs.find((tab) => tab.active)?.key ?? '';

  // URL berubah dari luar (tombol kembali browser): samakan isi kolom, kecuali URL itu hasil ketikan sendiri.
  if (search !== prevSearch) {
    setPrevSearch(search);
    if (search !== value.trim()) setValue(search);
  }

  // Pindah kategori/keluar halaman → batalkan pencarian yang belum terkirim agar tidak menimpa URL baru.
  useEffect(() => () => clearPending(timer), [activeKey]);

  // Di ponsel pil aktif bisa di luar layar: geser barisnya saja, bukan halaman.
  useEffect(() => {
    const row = pillsRef.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !active || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = active.offsetLeft - row.offsetLeft - (row.clientWidth - active.offsetWidth) / 2;
  }, [activeKey, tabs.length]);

  const commit = (next: string) => {
    clearPending(timer);
    if (next.trim() === search) return;
    onSearch(next.trim());
  };

  const onChange = (next: string) => {
    setValue(next);
    clearPending(timer);
    timer.current = window.setTimeout(() => commit(next), SEARCH_DEBOUNCE_MS);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    commit(value);
  };

  return (
    <header className={s.header}>
      <BackButton />
      <div className={s.top}>
        <div className={s.intro}>
          <h1 className={s.title}>{title}</h1>
          <p className={s.lead}>{lead}</p>
        </div>
        {searchable ? (
          <form role="search" className={s.search} onSubmit={onSubmit}>
            <label htmlFor={searchId} className={s.srOnly}>
              {searchLabel}
            </label>
            <IconSearch className={s.searchIcon} size={18} stroke={1.75} aria-hidden />
            <input
              id={searchId}
              type="search"
              className={s.searchInput}
              placeholder={searchPlaceholder}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              autoComplete="off"
            />
          </form>
        ) : null}
      </div>
      {/* Halaman tanpa kategori (Program Kesehatan) memberi `tabs=[]`: tanpa <nav> kosong & jarak sisa. */}
      {tabs.length > 0 ? (
        <nav ref={pillsRef} className={s.pills} aria-label={kategoriLabel}>
          {tabs.map((tab) => (
            <Link key={tab.key} href={tab.href} className={s.pill} aria-current={tab.active ? 'page' : undefined}>
              {tab.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function clearPending(timer: { current: number | null }) {
  if (timer.current !== null) window.clearTimeout(timer.current);
  timer.current = null;
}
