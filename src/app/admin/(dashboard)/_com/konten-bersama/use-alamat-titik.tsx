'use client'
import { Anchor, Text } from '@mantine/core';
import { useRef, useState } from 'react';
import { bolehIsiLokasiOtomatis, saranNamaTampil, type AlamatTitik } from './titik-peta.logic';

type FormLokasiNama = { lokasi: string; nama: string };

/**
 * Alamat titik peta → isi Lokasi otomatis (selama belum diubah admin) + saran Nama yang hanya dipakai bila admin klik "Pakai".
 * `ambilForm` mengembalikan objek form terkini (state valtio bisa diganti utuh saat reset/muat).
 */
export function useAlamatTitik(ambilForm: () => FormLokasiNama, namaSekarang: string) {
  const lokasiOtomatis = useRef<string | null>(null);
  const [saranNama, setSaranNama] = useState<string | null>(null);

  function onAlamatTitik({ alamat, nama }: AlamatTitik) {
    const form = ambilForm();
    if (bolehIsiLokasiOtomatis(form.lokasi, lokasiOtomatis.current)) {
      form.lokasi = alamat;
      lokasiOtomatis.current = alamat;
    }
    setSaranNama(nama);
  }

  function bersihkan() {
    lokasiOtomatis.current = null;
    setSaranNama(null);
  }

  const saran = saranNamaTampil(saranNama, namaSekarang);
  const deskripsiNama = saran ? (
    <Text component="span" fz="xs">
      Saran dari peta: {saran}{' '}
      <Anchor component="button" type="button" fz="xs" onClick={() => { ambilForm().nama = saran; }}>
        Pakai
      </Anchor>
    </Text>
  ) : undefined;

  return { onAlamatTitik, bersihkan, deskripsiNama };
}
