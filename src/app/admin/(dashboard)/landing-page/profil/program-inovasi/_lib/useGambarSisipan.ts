'use client';
import ApiFetch from '@/lib/api-fetch';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { periksaBerkasSisipan, periksaJumlahSisipan, unggahGambarSisipan } from './gambar-sisipan.logic';

/** Unggah satu gambar ke FileStorage (disimpan sebagai WebP) dan kembalikan link-nya. */
async function unggahKeStorage(file: File): Promise<string | null> {
  const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
  return res.data?.data?.link ?? null;
}

/**
 * Gambar sisipan deskripsi Program Inovasi: `pilih` memberi URL preview lokal untuk editor (belum diunggah),
 * `unggah` mengunggahnya saat Simpan dan mengembalikan HTML dengan link tersimpan (pola sama dengan logo/galeri).
 */
export function useGambarSisipan() {
  const berkas = useRef(new Map<string, File>());

  useEffect(() => {
    const peta = berkas.current;
    return () => peta.forEach((_, url) => URL.revokeObjectURL(url));
  }, []);

  const pilih = useCallback((file: File): string | null => {
    const masalah = periksaBerkasSisipan(file);
    if (masalah) {
      toast.error(masalah);
      return null;
    }
    const url = URL.createObjectURL(file);
    berkas.current.set(url, file);
    return url;
  }, []);

  /** HTML deskripsi siap simpan; melempar bila jumlah melebihi batas atau unggahan gagal. */
  const unggah = useCallback(async (html: string): Promise<string> => {
    const masalah = periksaJumlahSisipan(html);
    if (masalah) throw new Error(masalah);
    return unggahGambarSisipan(html, berkas.current, unggahKeStorage);
  }, []);

  return { pilih, unggah };
}
