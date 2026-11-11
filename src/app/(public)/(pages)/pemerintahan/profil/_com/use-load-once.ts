'use client'
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

/**
 * Jalankan loader CMS sekali saat mount dan kembalikan `true` setelah selesai (berhasil atau gagal).
 * State loader awalnya `loading: false, data: null`, jadi "belum dimuat" tidak bisa dibedakan dari "kosong" tanpa ini.
 */
export function useLoadOnce(load: () => Promise<unknown>): boolean {
  const [loaded, setLoaded] = useState(false);
  useShallowEffect(() => {
    // Loader menangkap galatnya sendiri (data tetap null) — finally hanya menandai selesai.
    void load().finally(() => setLoaded(true));
  }, []);
  return loaded;
}
