'use client'
import stateTimPengelola from '@/app/admin/(dashboard)/_state/desa/timPengelola';
import type { TimPengelolaPublicRecord } from '@/lib/tim-pengelola';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';

/**
 * Data publik Tim Pengelola Website untuk footer (nomor SK + tautan PDF, TANPA anggota): dimuat sekali lalu dibagi lewat
 * state bersama. `tim` null = belum termuat, gagal, atau admin belum mengisi; pemanggil tidak boleh mengisinya dengan nilai bawaan.
 */
export function useTimPengelola(): { tim: TimPengelolaPublicRecord | null } {
  const snap = useSnapshot(stateTimPengelola.findUnique);

  useEffect(() => {
    void stateTimPengelola.findUnique.ensureLoaded();
  }, []);

  return { tim: snap.data };
}
