'use client'
import stateKontakDesa from '@/app/admin/(dashboard)/_state/desa/kontakDesa';
import type { KontakDesaRecord } from '@/lib/kontak-desa';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';

/**
 * Kontak desa untuk pembaca publik (footer, PPID): dimuat sekali lalu dibagi lewat state bersama. `kontak` null =
 * belum termuat, gagal (`error` terisi), atau barisnya belum diisi admin; pemanggil tidak boleh mengisinya dengan nilai bawaan.
 */
export function useKontakDesa(): { kontak: KontakDesaRecord | null; error: string | null } {
  const snap = useSnapshot(stateKontakDesa.findUnique);

  useEffect(() => {
    void stateKontakDesa.findUnique.ensureLoaded();
  }, []);

  return { kontak: snap.data, error: snap.error };
}
