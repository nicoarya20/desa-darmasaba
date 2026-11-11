'use client';
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import { IconSearch } from '@tabler/icons-react';
import { Link, useTransitionRouter } from 'next-view-transitions';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../layanan/_com/BackButto';
import { activeSlug, beritaListHref, kategoriSlug } from './berita-list.logic';
import { SEARCH_DEBOUNCE_MS, SEMUA_SLUG } from './berita.meta';
import s from './berita-page.module.css';
import { BERITA_TEXT } from './berita.text';

/** Kepala halaman daftar berita: kembali, judul + pengantar, kolom cari, lalu pil kategori (tautan). */
export function BeritaHeader() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kategoriState = useProxy(stateDashboardBerita.kategoriBerita);
  const searchId = useId();

  const slug = activeSlug(pathname);
  const urlSearch = searchParams.get('search')?.trim() ?? '';
  const [value, setValue] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const timer = useRef<number | null>(null);
  const pillsRef = useRef<HTMLElement>(null);

  // URL berubah dari luar (tombol kembali browser): samakan isi kolom, kecuali URL itu hasil ketikan sendiri.
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    if (urlSearch !== value.trim()) setValue(urlSearch);
  }

  useEffect(() => {
    kategoriState.findMany.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- daftar kategori cukup dimuat sekali per kunjungan
  }, []);

  // Pindah kategori/keluar halaman → batalkan pencarian yang belum terkirim agar tidak menimpa URL baru.
  useEffect(() => () => clearPending(timer), [slug]);

  const tabCount = (kategoriState.findMany.data ?? []).length + 1;

  // Di ponsel pil aktif bisa di luar layar (mis. buka /berita/teknologi): geser barisnya saja, bukan halaman.
  useEffect(() => {
    const row = pillsRef.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !active || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = active.offsetLeft - row.offsetLeft - (row.clientWidth - active.offsetWidth) / 2;
  }, [slug, tabCount]);

  const commit = (next: string) => {
    clearPending(timer);
    if (next.trim() === urlSearch) return;
    router.replace(beritaListHref(slug, { search: next }));
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

  const tabs = [
    { slug: SEMUA_SLUG, label: BERITA_TEXT.semua },
    ...(kategoriState.findMany.data ?? []).map((kat) => ({ slug: kategoriSlug(kat.name), label: kat.name })),
  ];

  return (
    <header className={s.header}>
      <BackButton />
      <div className={s.top}>
        <div className={s.intro}>
          <h1 className={s.title}>{BERITA_TEXT.title}</h1>
          <p className={s.lead}>{BERITA_TEXT.lead}</p>
        </div>
        <form role="search" className={s.search} onSubmit={onSubmit}>
          <label htmlFor={searchId} className={s.srOnly}>
            {BERITA_TEXT.searchLabel}
          </label>
          <IconSearch className={s.searchIcon} size={18} stroke={1.75} aria-hidden />
          <input
            id={searchId}
            type="search"
            className={s.searchInput}
            placeholder={BERITA_TEXT.searchPlaceholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete="off"
          />
        </form>
      </div>
      <nav ref={pillsRef} className={s.pills} aria-label={BERITA_TEXT.kategoriLabel}>
        {tabs.map((tab) => (
          <Link
            key={tab.slug}
            href={beritaListHref(tab.slug, { search: urlSearch })}
            className={s.pill}
            aria-current={tab.slug === slug ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function clearPending(timer: { current: number | null }) {
  if (timer.current !== null) window.clearTimeout(timer.current);
  timer.current = null;
}
