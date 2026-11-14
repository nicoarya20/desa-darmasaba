'use client';

import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { activeMusikNav, keepsPendingSearch, musikSearchNavigation, reconcileSentQ } from './musik-nav.logic';
import { MUSIK_APP_TEXT as T, MUSIK_SEARCH_DEBOUNCE_MS } from './musik-nav.meta';
import s from './musik-app.module.css';

/**
 * Kolom cari aplikasi musik. Mengetik (jeda 300ms) membuka Jelajahi dengan `?q=`: di Jelajahi URL diganti
 * (genre/artis dipertahankan), dari menu lain URL didorong ke riwayat. Nilai mengikuti `?q=` di Jelajahi,
 * kecuali `?q=` itu gema kiriman sendiri (ketikan saat navigasi lambat tidak ditimpa). Pindah ke menu selain
 * Jelajahi membatalkan ketikan yang masih menunggu jeda.
 * Memakai useSearchParams → pemanggil wajib membungkusnya dengan `<Suspense>`.
 */
export function MusikTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onJelajahi = activeMusikNav(pathname) === 'jelajahi';
  const urlQ = onJelajahi ? (searchParams.get('q') ?? '') : '';

  const [value, setValue] = useState(urlQ);
  // true hanya bila nilai berubah karena diketik (bukan disinkronkan dari URL) → baru boleh navigasi.
  const typed = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  // Kata yang sudah dikirim tapi belum terlihat di URL (urut kirim), lihat reconcileSentQ.
  const [sentQs, setSentQs] = useState<string[]>([]);

  // Sinkron dari URL (tombol mundur, "Hapus filter", pindah menu) tanpa menimpa spasi yang sedang diketik.
  const [syncedQ, setSyncedQ] = useState(urlQ);
  if (syncedQ !== urlQ) {
    setSyncedQ(urlQ);
    const { sent, adopt } = reconcileSentQ(sentQs, urlQ);
    setSentQs(sent);
    if (adopt && value.trim() !== urlQ.trim()) setValue(urlQ);
  }

  const navigate = (q: string) => {
    typed.current = false;
    const target = musikSearchNavigation(q, window.location.pathname, window.location.search);
    if (!target) return;
    const term = q.trim();
    // Kata sama dengan ?q= sekarang tidak mengubah URL → tidak akan ada gema yang perlu dikenali.
    if (term !== urlQ) setSentQs((prev) => [...prev, term]);
    if (target.mode === 'replace') router.replace(target.href, { scroll: false });
    else router.push(target.href);
  };

  // Timer memanggil versi navigate terbaru tanpa menjadwal ulang tiap render.
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  });

  useEffect(() => {
    if (!typed.current) return;
    timer.current = window.setTimeout(() => {
      // Sudah dikirim lewat Enter selama jeda → jangan navigasi dua kali.
      if (typed.current) navigateRef.current(value);
    }, MUSIK_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer.current);
  }, [value]);

  // Pindah ke Playlist/Musik saat jeda berjalan: jangan tarik pengunjung kembali ke Jelajahi.
  useEffect(() => {
    if (keepsPendingSearch(pathname)) return;
    window.clearTimeout(timer.current);
    typed.current = false;
  }, [pathname]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.clearTimeout(timer.current);
    navigate(value);
  };

  return (
    <div className={s.topbar}>
      <form role="search" className={s.search} onSubmit={onSubmit}>
        <label htmlFor="musik-search" className={s.sr}>
          {T.searchLabel}
        </label>
        <IconSearch size={18} stroke={1.75} className={s.searchIcon} aria-hidden />
        <input
          id="musik-search"
          type="search"
          className={s.searchInput}
          placeholder={T.searchPlaceholder}
          value={value}
          autoComplete="off"
          enterKeyHint="search"
          onChange={(event) => {
            typed.current = true;
            setValue(event.target.value);
          }}
        />
      </form>
    </div>
  );
}
