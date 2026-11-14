'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/** Kunci localStorage preferensi panel Antrean (terbuka/tertutup). */
export const QUEUE_OPEN_STORAGE_KEY = 'musik-desa:queue-open';
/** Lebar minimal (px) tempat panel Antrean terbuka bawaan sebagai kolom kanan. */
export const QUEUE_OPEN_DEFAULT_MIN_WIDTH = 1280;

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

function writeStoredQueueOpen(open: boolean) {
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
    const stored = readStoredQueueOpen();
    setQueueOpen(stored ?? window.innerWidth >= QUEUE_OPEN_DEFAULT_MIN_WIDTH);
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
