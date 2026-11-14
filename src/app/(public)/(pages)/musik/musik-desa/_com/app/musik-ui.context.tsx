'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/** Kunci localStorage preferensi panel Antrean (terbuka/tertutup). */
export const QUEUE_OPEN_STORAGE_KEY = 'musik-desa:queue-open';
/** Media query tempat panel Antrean tampil sebagai kolom kanan (bukan Drawer). */
export const QUEUE_COLUMN_QUERY = '(min-width: 1280px)';

type MusikUiValue = {
  queueOpen: boolean;
  toggleQueue: () => void;
  closeQueue: () => void;
};

const MusikUiContext = createContext<MusikUiValue | undefined>(undefined);

/** Ubah nilai tersimpan jadi boolean; nilai lain/kosong → null (pakai bawaan lebar layar). */
export function parseQueueOpen(raw: string | null): boolean | null {
  if (raw === '1') return true;
  if (raw === '0') return false;
  return null;
}

function readStoredQueueOpen(): boolean | null {
  try {
    return parseQueueOpen(window.localStorage.getItem(QUEUE_OPEN_STORAGE_KEY));
  } catch (error) {
    // localStorage bisa melempar (mode privat / data situs diblokir): preferensi hanya kenyamanan,
    // jadi jatuh ke bawaan lebar layar, tapi tetap dicatat supaya tidak hilang tanpa jejak.
    console.warn(`[musik-desa] Gagal membaca ${QUEUE_OPEN_STORAGE_KEY}: ${(error as Error).message}`);
    return null;
  }
}

const isColumnViewport = () => window.matchMedia(QUEUE_COLUMN_QUERY).matches;

/**
 * Status antrean untuk lebar layar saat ini (setelah mount & tiap melintasi 1280px). Di bawah 1280px
 * antrean berupa Drawer yang menutupi konten, jadi selalu tertutup; preferensi tersimpan (bawaan
 * terbuka) hanya berlaku untuk kolom kanan.
 */
export function queueOpenForViewport(isColumn: boolean, stored: boolean | null): boolean {
  return isColumn && (stored ?? true);
}

function writeStoredQueueOpen(open: boolean) {
  // Buka/tutup Drawer di layar sempit tidak boleh menimpa preferensi kolom desktop.
  if (!isColumnViewport()) return;
  try {
    window.localStorage.setItem(QUEUE_OPEN_STORAGE_KEY, open ? '1' : '0');
  } catch (error) {
    console.warn(`[musik-desa] Gagal menyimpan ${QUEUE_OPEN_STORAGE_KEY}: ${(error as Error).message}`);
  }
}

/** Status UI aplikasi Musik Desa (panel Antrean) yang dibagi sidebar, bar pemutar, dan panel. */
export function MusikUiProvider({ children }: { children: ReactNode }) {
  // SSR & render pertama selalu tertutup supaya markup server = klien; nilai asli dibaca setelah mount.
  const [queueOpen, setQueueOpen] = useState(false);

  useEffect(() => {
    const columnQuery = window.matchMedia(QUEUE_COLUMN_QUERY);
    setQueueOpen(queueOpenForViewport(columnQuery.matches, readStoredQueueOpen()));
    // Melebar/menyempit melintasi 1280px: kolom terbuka tidak boleh berubah jadi Drawer yang menutupi
    // halaman. Tidak menulis localStorage, jadi preferensi kolom desktop tetap.
    const onChange = (event: MediaQueryListEvent) =>
      setQueueOpen(queueOpenForViewport(event.matches, readStoredQueueOpen()));
    columnQuery.addEventListener('change', onChange);
    return () => columnQuery.removeEventListener('change', onChange);
  }, []);

  const toggleQueue = useCallback(() => {
    const next = !queueOpen;
    setQueueOpen(next);
    writeStoredQueueOpen(next);
  }, [queueOpen]);

  const closeQueue = useCallback(() => {
    setQueueOpen(false);
    writeStoredQueueOpen(false);
  }, []);

  const value = useMemo(() => ({ queueOpen, toggleQueue, closeQueue }), [queueOpen, toggleQueue, closeQueue]);

  return <MusikUiContext.Provider value={value}>{children}</MusikUiContext.Provider>;
}

/** Baca status panel Antrean; wajib di dalam `MusikUiProvider`. */
export function useMusikUi(): MusikUiValue {
  const context = useContext(MusikUiContext);
  if (context === undefined) {
    throw new Error('useMusikUi must be used within a MusikUiProvider');
  }
  return context;
}
